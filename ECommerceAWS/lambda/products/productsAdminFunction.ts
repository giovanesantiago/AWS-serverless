import { RetryMode } from "aws-cdk-lib/aws-codepipeline";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import * as lambda from 'aws-cdk-lib/aws-lambda';


export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

    const lambdaRequestId = context.awsRequestId;
    const apiRequestId = event.requestContext.requestId;

    console.log(`API Gateway RequestId : ${apiRequestId} - Lamda RequestId ${lambdaRequestId}`)

    if(event.resource === "/products"){
        console.log("POST /products")

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: "Produto criado com sucesso !"
            })
        }
    }else if (event.resource == "/products/{id}"){
        const productId = event.pathParameters!.id as string;

        if(event.httpMethod == 'PUT'){
            console.log(`PUT /products/${productId}`)

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Produto ${productId} editado com sucesso !`
            })
        }
        } else if (event.httpMethod == 'DELETE'){
            console.log(`DELTE /products/${productId}`)

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: `Produto ${productId} deletado com sucesso !`
                })
            }
        }
    }
    
    return {
        statusCode: 400,
        body: JSON.stringify({
            message: "Solicitacao invalida"
        })
    }
}