echo "[Pre-Build phase] `date` in `pwd`"

passthrough_dir="${BLUEPRINTS_DIR}/deploy/cloudformation/"
passthrough_yml="primo-passthrough.yml"

echo "Copy the $passthrough_yml to this project so it can run"
echo "${passthrough_dir}${passthrough_yml}"
cp ${passthrough_dir}${passthrough_yml} .
