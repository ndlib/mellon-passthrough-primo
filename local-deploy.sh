PROGNAME=$0

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

usage() {
  cat << EOF >&2
Usage: $PROGNAME stackname path-to-blueprints

Deploys the pipeline to the stage.
Note: Ensure you have an env variable S3_BUCKET as the bucket to deploy to.

EOF
  exit 1
}

stackname=$1
export BLUEPRINTS_DIR=$2

# check num args
if [ "$#" -ne 2 ]; then
  printf "${RED}Illegal number of parameters - $# ${NC}\n"
  usage
fi

# check S3_BUCKET env var set
if [ -z ${S3_BUCKET+x} ]; then
  printf "${RED}S3_BUCKET env var not set ${NC}\n"
  usage
fi

./scripts/codebuild/pre_build.sh
./scripts/codebuild/build.sh
./scripts/codebuild/post_build.sh

aws cloudformation deploy --template-file output.yml --stack-name $stackname \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides AppConfigPath="/all/$stackname"

rm -f output.yml
