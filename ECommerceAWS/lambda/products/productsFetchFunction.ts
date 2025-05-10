import { RetryMode } from "aws-cdk-lib/aws-codepipeline";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";


export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const method = event.httpMethod;
    const lambdaRequestID = context.awsRequestId;
    const apiRequestId = event.requestContext.requestId;

    console.log(`API Gateway RequestId : ${apiRequestId} - Lamda RequestId ${lambdaRequestID}`)
    if(event.resource === "/products"){
        if(method === 'GET'){
            console.log('GET')

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'GET - /products'
                })
            }
        }
    }else if (event.resource === '/products/{id}'){
        const productId = event.pathParameters!.id;
        console.log(`GET - /products/${productId}`)
        return {
            statusCode: 200,
            body: `GET - /products/${productId}`
        }
    }

    return {
        statusCode: 400,
        body: JSON.stringify({
            message: 'Bad Request'
        })
    }
}