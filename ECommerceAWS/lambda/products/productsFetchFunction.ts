import { RetryMode } from "aws-cdk-lib/aws-codepipeline";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { ProductRepository } from "/opt/nodejs/productsLayer";
import { DynamoDB } from "aws-sdk";
import  * as AWSRay from "aws-xray-sdk";

// Capturando tudo que fiz pelo sdk
AWSRay.captureAWS(require("aws-sdk"));

const productsDdb = process.env.PRODUCTS_DDB!;
const ddbCliente = new DynamoDB.DocumentClient();

const productRepository = new ProductRepository(ddbCliente, productsDdb);

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const method = event.httpMethod;
    const lambdaRequestID = context.awsRequestId;
    const apiRequestId = event.requestContext.requestId;

    console.log(`API Gateway RequestId : ${apiRequestId} - Lamda RequestId ${lambdaRequestID}`)
    if (event.resource === "/products") {
        if (method === 'GET') {
            console.log('GET/products')

            const products = await productRepository.getAllProducts();
            return {
                statusCode: 200,
                body: JSON.stringify(products)
            }
        }
    } else if (event.resource === '/products/{id}') {
        const productId = event.pathParameters!.id as string;
        console.log(`GET - /products/${productId}`)

        try {
            const product = await productRepository.getProductsById(productId);
            return {
                statusCode: 200,
                body: JSON.stringify(product)
            }
        } catch (error){
            console.error((<Error>error).message);
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: (<Error>error).message
                })
            }
        }
    }

    return {
        statusCode: 400,
        body: JSON.stringify({
            message: 'Bad Request'
        })
    }
}