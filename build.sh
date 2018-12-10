#!/usr/bin/env bash

current_dir=$(cd "$(dirname "$0")" && pwd)
echo "Running build in dir \"$current_dir\" ..."

echo "Changing to dir \"$current_dir/code/nodejs\" ..."
cd $current_dir/code/nodejs

echo "Running \"npm install\" ..."
npm install-test


echo "Changing to dir \"$current_dir/infrastructure/deployment\" ..."
cd $current_dir/infrastructure/deployment
echo "Changed to dir \"$(pwd)\"."

echo "Running \"terraform init+validate+plan+apply\" ..."
terraform init
terraform validate
terraform plan -out=plan.tfp
terraform apply "plan.tfp"

