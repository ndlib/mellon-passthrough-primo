echo "[Build phase] `date` in `pwd`"
echo "S3 Bucket"
echo $S3_BUCKET

echo "AWS Package Command"
cmd="aws cloudformation package --template-file manifest-passthrough.yml --s3-bucket $S3_BUCKET --output-template-file output.yml"
echo "${cmd}"
${cmd}
