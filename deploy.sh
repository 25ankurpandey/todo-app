#!/bin/bash
set -x

service_name="todosvc"

ENVIRONMENT=$1

if [[ $ENVIRONMENT == "prod" ]]; then
    NAMESPACE="$service_name"
elif [[ $ENVIRONMENT == "dev" ]]; then
    NAMESPACE="$service_name-$ENVIRONMENT"
else
    echo "Invalid environment. Use 'dev' or 'prod'."
    exit 1
fi

if [ ! -d "$HOME/todo-svc" ]; then
    echo "No such directory: $HOME/todosvc/"
    exit 1
fi

cd $HOME/todo-app/charts/todosvc

output_file_name="/tmp/$service_name-final-$ENVIRONMENT-values.yaml"

echo "Merging all values files into one /tmp/$service_name-final-$ENVIRONMENT-values.yaml"

yq eval-all \
    'select(fileIndex == 0) * select(fileIndex == 1)'
    values-defaults.yaml \
    env-overrides/values-$ENVIRONMENT.yaml \
    > $output_file_name

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

if [[ $? == 0 ]]; then
    echo -e "the value of dry is $DRY_RUN"
    if [ ${DRY_RUN} == true ]; then
        echo -e "Running dry run"
        helm upgrade \
            -v 5 \
            --dry-run \
            --set namespace=${NAMESPACE} \
            --namespace $NAMESPACE \
            --logtostderr \
            --debug \
            --install \
            --atomic \
            --timeout 900s \
            --cleanup-on-fail \
            --values $output_file_name \
            $service_name \
            . 2>&1
    else
        echo "Doing Release!"
        helm upgrade \
            -v 5 \
            --namespace $NAMESPACE \
            --set namespace=${NAMESPACE} \
            --logtostderr \
            --debug \
            --install \
            --atomic \
            --timeout 900s \
            --cleanup-on-fail \
            --values $output_file_name \
            $service_name \
            . 2>&1
    fi
else
    echo "Helm Template validation failed. Hence release is halted!"
fi
