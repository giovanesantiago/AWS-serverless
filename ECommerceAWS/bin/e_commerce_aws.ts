#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {ProductsAppStack} from '../lib/productsApp-stack';
import {ECommerceApiStack } from '../lib/ecommerceApi-stack';
import { ProductsAppLayersStack } from '../lib/productsAppLayers';

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
const productsAppLayersStack = new ProductsAppLayersStack(app, "ProductsAppLayers", {
  tags: tags,
  env: env
})

const productsAppStack = new ProductsAppStack(app, "ProductsApp", {
  tags: tags,
  env: env
});

productsAppStack.addDependency(productsAppLayersStack);

const eCommerceApiStack = new ECommerceApiStack(app, "ECmmerceApiStack", {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  productsAdminHandler: productsAppStack.productsAdminHandler,
  tags: tags,
  env: env
});

// Indicando que eCommerceApiStack depende productsAppStack
eCommerceApiStack.addDependency(productsAppStack);