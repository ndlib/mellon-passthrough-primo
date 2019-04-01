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

# user inputs
# stack name
stackname=$1
# mellon-blueprints location
export BLUEPRINTS_DIR=$2
# primo api key
pak=$3
# primo sandbox api key
psak=$4
# primo url
purl=$5


# check num args
if [ "$#" -ne 5 ]; then
  printf "${RED}Illegal number of parameters - $# ${NC}\n"
  usage
fi

# check S3_BUCKET env var set
if [ -z ${S3_BUCKET+x} ]; then
  printf "${RED}S3_BUCKET env var not set ${NC}\n"
  usage
fi

./scripts/codebuild/install.sh
./scripts/codebuild/pre_build.sh
./scripts/codebuild/build.sh
./scripts/codebuild/post_build.sh

aws cloudformation deploy --template-file output.yml --stack-name $stackname \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides AppConfigPath="/all/${stackname}" \
  PrimoApiKey=${pak} PrimoSandboxApiKey=${psak} \
  Version=dev PassthroughUrl=${purl}

rm -f output.yml
