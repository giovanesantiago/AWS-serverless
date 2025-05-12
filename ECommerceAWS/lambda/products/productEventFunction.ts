import { Callback, Context } from "aws-lambda";
import { ProductEvent } from "/opt/nodejs/productEventLayer";
import { DynamoDB } from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk";
import { request } from "http";
import { EventType } from "aws-cdk-lib/aws-s3";

AWSXRay.captureAWS(require("aws-sdk"));

const eventDddb = process.env.EVENT_DDB!;
const ddcClient = new DynamoDB.DocumentClient();

export async function handler(event: ProductEvent, context: Context, callback: Callback): Promise<void> {
    //TODO - to be removed
    console.log(event);
    console.log(`Lambda requestId : ${context.awsRequestId}`);

    await createEvent(event);

    callback(null, JSON.stringify({
        productEventCreated: true,
        message: "OK"
    }))
}

function createEvent(event: ProductEvent) {
    const timestamp = Date.now();
    const ttl = ~~(timestamp / 1000) + 5 * 60; // 5 minutos a frente 

    return ddcClient.put({
        TableName: eventDddb,
        Item: {
            pk: `#product_${event.productCode}`,
            sk: `${event.eventType}#${timestamp}`,
            email: `${event.email}`,
            createdAt: timestamp,
            requestId: event.requestId,
            eventType: event.eventType,
            info: {
                productId: event.productId,
                price: event.productPrice
            },
            ttl: ttl
        }
    }).promise()
}