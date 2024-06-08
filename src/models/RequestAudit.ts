import { DataTypes, Model, Optional } from "sequelize";

interface RequestAuditAttributes {
  id?: number;
  url: string;
  action: string;
  data: any;
  status_code: number;
  trace_id: string;
}
export type RequestAuditInput = Optional<RequestAuditAttributes, null>;
export type RequestAuditOutput = Required<RequestAuditAttributes>;

export const RequestAuditClassFactory = function () {
  return class RequestAudit
    extends Model<RequestAuditAttributes, RequestAuditInput>
    implements RequestAuditAttributes
  {
    public id: number;
    public url: string;
    public action: string;
    public data: JSON;
    public status_code: number;
    public trace_id: string;
  };
};

export const RequestAuditModel = {
  id: {
    type: DataTypes.BIGINT({ length: 20 }),
    primaryKey: true,
    autoIncrement: true,
  },
  url: {
    type: DataTypes.STRING(2000),
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING(10),
  },
  data: {
    type: DataTypes.JSON,
  },
  status_code: {
    type: DataTypes.SMALLINT,
  },
  trace_id: {
    type: DataTypes.STRING(50)
  }
};