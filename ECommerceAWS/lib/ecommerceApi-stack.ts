import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from "aws-cdk-lib/aws-apigateway"
import * as cwlogs from "aws-cdk-lib/aws-logs"
import { Construct } from 'constructs';

interface ECommerceApiStackProps extends cdk.StackProps {
    productsFetchHandler: lambdaNodeJs.NodejsFunction,
    productsAdminHandler: lambdaNodeJs.NodejsFunction
}

export class ECommerceApiStack extends cdk.Stack{

    constructor(scope: Construct, id: string, props: ECommerceApiStackProps){
        super(scope, id, props)

        const logGroup = new cwlogs.LogGroup(this, "ECommerceApiLogs") 
        const api = new apigateway.RestApi(this, "ECommerceApi", {
            restApiName: "ECommerceApi",
            cloudWatchRole: true,
            deployOptions: {
                accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
                accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({ 
                    httpMethod: true, 
                    ip: true, 
                    protocol: true,
                    requestTime: true, 
                    resourcePath: true, 
                    responseLength: true, 
                    status: true,
                    caller: true, 
                    user: true 
                })
            }
        })

        const productsFetcIntegration = new apigateway.LambdaIntegration(props.productsFetchHandler);

        // "/products"
        const productsResource = api.root.addResource("products")
        productsResource.addMethod('GET', productsFetcIntegration)
        // "/products/{id}"
        const productsIdResource = productsResource.addResource("{id}")
        productsIdResource.addMethod("GET", productsFetcIntegration)

        const productsAdminIntegration = new apigateway.LambdaIntegration(props.productsAdminHandler)

        // "/products" - POST
        productsResource.addMethod("POST", productsAdminIntegration)
        // "/products/{id}" - PUT
        productsIdResource.addMethod("PUT", productsAdminIntegration)
        // "/products/{id}" - DELETE
        productsIdResource.addMethod("DELETE", productsAdminIntegration)
    }
}