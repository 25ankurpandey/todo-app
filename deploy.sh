#!/bin/bash
set -x


# Usage: deploy.sh <environment name> Example: deploy.sh qa --dry-run
# This script can only be executed when we are logged into the admin environment

service_name="tplserviceabilitysvc"
#secrets_path="/tmp/$service_name-$ENVIRONMENT"

ENVIRONMENT=$1
NAMESPACE=$2

if [[ $ENVIRONMENT == "prod" || $ENVIRONMENT == "staging" ]]; then
    NAMESPACE="$service_name"
    region="ap-south-1"
    secrets_path="/tmp/$service_name-$ENVIRONMENT-$PROJECT"
elif [[ "${ENVIRONMENT}" == "qa" || "${ENVIRONMENT}" == "hqa" ]]; then
    if [ "${PROJECT}" == "bb-stable" ]; then
        NAMESPACE="$service_name-bbstable-${ENVIRONMENT}"
        secrets_path="/tmp/$service_name-$ENVIRONMENT-$PROJECT"
    else
        NAMESPACE="$service_name-${ENVIRONMENT}"
        secrets_path="/tmp/$service_name-$ENVIRONMENT"
    fi
    region="us-east-1"
else
    NAMESPACE="$service_name-${ENVIRONMENT}"
    secrets_path="/tmp/$service_name-$ENVIRONMENT"
    region="us-east-1"
fi

    if [ ! -d "$HOME/tpl-serviceability-svc" ]; then
        echo "No such directory: $HOME/tplserviceabilitysvc/"
        exit 1
    fi

mkdir -p $secrets_path


if [[ "${ENVIRONMENT}" == "prod" || "${ENVIRONMENT}" == "staging" ]]; then
    echo -e "pulling $ENVIRONMENT app secrets"
    aws s3 cp s3://bbconf-india/micro-svcs/$service_name/$ENVIRONMENT/conf/values-secrets.yaml $secrets_path --region $region
    echo -e "pulling $ENVIRONMENT infra secrets"
    aws s3 cp s3://bbconf-india/$ENVIRONMENT/infra-settings/values-infra-secrets.yaml $secrets_path/values-infra-secrets.yaml --region $region
elif [ "${ENVIRONMENT}" == "dev" -o "${ENVIRONMENT}" == "qa" -o "${ENVIRONMENT}" == "hqa" -o "${ENVIRONMENT}" == "uat" ]; then
    echo -e "pulling $ENVIRONMENT app secrets"
    aws s3 cp s3://qa-conf/msvc/$service_name/$ENVIRONMENT/conf/values-secrets.yaml $secrets_path --region $region
    echo -e "pulling $ENVIRONMENT infra secrets"
    aws s3 cp s3://qa-conf/$ENVIRONMENT/infra-settings/values-infra-secrets-$ENVIRONMENT.yaml $secrets_path/values-infra-secrets.yaml --region $region
else
    echo -e "Can not pull any secrets."
fi

echo -e "Running Heva..."
cd $HOME/tpl-serviceability-svc/charts/tplserviceabilitysvc
printf "Heva version: $(heva -v)"

output_file_name="/tmp/$service_name-final-$ENVIRONMENT-values.yaml"

echo "Merging all values files into one /tmp/$service_name-final-$ENVIRONMENT-values.yaml"
if [[ -z "${PROJECT}" ]]; then
    echo "No 'Project' Environment variable found! Going with default/stable."
    heva -f values-defaults.yaml \
    -f $secrets_path/values-secrets.yaml \
    -f $secrets_path/values-infra-secrets.yaml \
    -f env-overrides/values-$ENVIRONMENT.yaml \
    -o $output_file_name 2>&1
else
  echo "Project=$PROJECT Environment variable found. Going with that."
  output_file_name="/tmp/$service_name-final-$ENVIRONMENT-$PROJECT-values.yaml"
  heva \
    -f values-defaults.yaml \
    -f $secrets_path/values-secrets.yaml \
    -f $secrets_path/values-infra-secrets.yaml \
    -f env-overrides/values-$ENVIRONMENT.yaml \
    -f project-overrides/values-$ENVIRONMENT-$PROJECT.yaml \
    -o $output_file_name 2>&1
fi

echo "Final Helm values file content:"
cat $output_file_name

echo -e "Rendering helm templates based on supplied values file:"
helm template -v 5 \
--namespace $NAMESPACE \
--set namespace=${NAMESPACE} \
--logtostderr \
--debug \
--values $output_file_name \
. 2>&1

if [[ $? == 0 ]];then
    echo -e "the value of dry is $DRY_RUN"
    if [ ${DRY_RUN} == true ]; then
        echo -e "Runinng dry run"
        if [[ -z "${PROJECT}" ]]; then
            helm upgrade \
                -v 5 \
                --dry-run \
                --set namespace=${NAMESPACE} \
                --namespace $NAMESPACE \
                --logtostderr \
                --debug \
                --install \
                --atomic  \
                --timeout 900s \
                --cleanup-on-fail \
                --values $output_file_name \
                $service_name \
                . 2>&1
        else
            helm upgrade \
                -v 5 \
                --dry-run \
                --set namespace=${NAMESPACE} \
                --namespace $NAMESPACE \
                --logtostderr \
                --debug \
                --install \
                --atomic  \
                --timeout 900s \
                --cleanup-on-fail \
                --values $output_file_name \
                $service_name-$PROJECT \
                . 2>&1
        fi
    else
        echo "Doing Release!"
        if [[ -z "${PROJECT}" ]]; then
            helm upgrade \
                -v 5 \
                --namespace $NAMESPACE \
                --set namespace=${NAMESPACE} \
                --logtostderr \
                --debug \
                --install \
                --atomic  \
                --timeout 900s \
                --cleanup-on-fail \
                --values $output_file_name \
                $service_name \
                . 2>&1
        else
            helm upgrade \
                -v 5 \
                --namespace $NAMESPACE \
                --set namespace=${NAMESPACE} \
                --logtostderr \
                --debug \
                --install \
                --atomic  \
                --timeout 900s \
                --cleanup-on-fail \
                --values $output_file_name \
                $service_name-$PROJECT \
                . 2>&1
        fi
    fi
else
    echo "Helm Template validation failed. Hence release is halted!"
fi