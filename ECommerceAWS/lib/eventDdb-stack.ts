import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamondb from "aws-cdk-lib/aws-dynamodb";

export class EventDdbStack extends cdk.Stack {
    readonly table: dynamondb.Table;

    constructor(scopo: Construct, id: string, props?: cdk.StackProps){
        super(scopo, id, props);

        this.table = new dynamondb.Table(this, "EventDdb", {
            tableName: "event",
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            partitionKey: {
                name: "pk",
                type: dynamondb.AttributeType.STRING
            },
            sortKey: {
                name: "sk",
                type: dynamondb.AttributeType.STRING
            },
            timeToLiveAttribute: "ttl", // atributo para tempo de apagar item no bd
            billingMode: dynamondb.BillingMode.PROVISIONED,
            writeCapacity: 1,
            readCapacity: 1
        })
    }

}