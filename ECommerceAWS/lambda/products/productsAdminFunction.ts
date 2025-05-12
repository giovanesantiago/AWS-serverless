import { RetryMode } from "aws-cdk-lib/aws-codepipeline";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Product, ProductRepository } from "/opt/nodejs/productsLayer";
import { DynamoDB, Lambda } from "aws-sdk";
import { ProductEvent, ProductEventType } from "/opt/nodejs/productEventLayer";
import * as AWSRay from "aws-xray-sdk";

// Capturando tudo que fiz pelo sdk
AWSRay.captureAWS(require("aws-sdk"));

const productsDdb = process.env.PRODUCTS_DDB!;
const ddbCliente = new DynamoDB.DocumentClient();

const productEventFunctionName = process.env.PRODUCT_EVENT_FUNCTION_NAME!;
const lambdaClient = new Lambda();

const productRepository = new ProductRepository(ddbCliente, productsDdb);

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const lambdaRequestId = context.awsRequestId;
    const apiRequestId = event.requestContext.requestId;

    console.log(`API Gateway RequestId : ${apiRequestId} - Lamda RequestId ${lambdaRequestId}`)

    if (event.resource === "/products") {
        console.log("POST /products")

        const product = JSON.parse(event.body!) as Product;
        const productCreate = await productRepository.create(product);

        const reponse = await sendProductEvent(productCreate, ProductEventType.CREATED, "sentaaqu@sentou.com", lambdaRequestId)
        console.log(reponse)

        return {
            statusCode: 201,
            body: JSON.stringify(productCreate)
        }
    } else if (event.resource == "/products/{id}") {
        const productId = event.pathParameters!.id as string;

        if (event.httpMethod == 'PUT') {
            console.log(`PUT /products/${productId}`)

            try {
                const product = JSON.parse(event.body!) as Product;
                const productUpdated = await productRepository.updateProduct(productId, product);

                const reponse = await sendProductEvent(productUpdated, ProductEventType.UPDATED, "sentaaqu@sentou.com", lambdaRequestId)
                console.log(reponse)

                return {
                    statusCode: 200,
                    body: JSON.stringify(productUpdated)
                }
            } catch (ConditionalCheckFailedException) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({
                        message: "Product not Found"
                    })
                }
            }
        } else if (event.httpMethod == 'DELETE') {
            console.log(`DELTE /products/${productId}`)

            try {
                const product = await productRepository.deleteProduct(productId);

                const reponse = await sendProductEvent(product, ProductEventType.DELETE, "sentaaqu@sentou.com", lambdaRequestId)
                console.log(reponse)

                return {
                    statusCode: 200,
                    body: JSON.stringify(product)
                };
            } catch (error) {
                console.log((<Error>error).message);
                return {
                    statusCode: 404,
                    body: JSON.stringify({
                        message: (<Error>error).message
                    })
                };
            };
        }
    }

    return {
        statusCode: 400,
        body: JSON.stringify({
            message: "Solicitacao invalida"
        })
    }
}

function sendProductEvent(product: Product, eventType: ProductEventType, email: string, lambdaRequestId: string) {

    const event: ProductEvent = {
        requestId: lambdaRequestId,
        eventType: eventType,
        productId: product.id,
        productCode: product.code,
        productPrice: product.price,
        email: email
    }

    return lambdaClient.invoke({
        FunctionName: productEventFunctionName,
        Payload: JSON.stringify(event),
        InvocationType: "RequestResponse"
    }).promise();
}