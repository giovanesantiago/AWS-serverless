#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {ProductsAppStack} from '../lib/productsApp-stack';
import {ECommerceApiStack } from '../lib/ecommerceApi-stack';

const app = new cdk.App();

// Configuracoes de conta
const env: cdk.Environment = {
  account: "444770236073",
  region: "us-east-1"
}

// Entiquetando recursos
const tags = {
  const: "ECommerce",
  team: "ThanosCode"
}

// Criando Stacks
const productsAppStack = new ProductsAppStack(app, "ProductsApp", {
  tags: tags,
  env: env
});

const eCommerceApiStack = new ECommerceApiStack(app, "ECmmerceApiStack", {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  tags: tags,
  env: env
});

// Indicando que eCommerceApiStack depende productsAppStack
eCommerceApiStack.addDependency(productsAppStack);