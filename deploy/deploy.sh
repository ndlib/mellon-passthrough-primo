

PROGNAME=$0
LOG_DIR_BASE=$(pwd)

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

usage() {
  cat << EOF >&2
Usage: $PROGNAME sfx|primo [-b <branch>] [-p <project>]

deploys the passthrough stage
can do all or 1

-b <branch>: The branch to deploy otherwise uses the current VERSION file
-p <project>: The specific project to deploy otherwise delploys all
EOF
  exit 1
}

stage=$1
deployType=$2
hesdeploy_extra=""

echo $stage

if [ -z "$1" ] || [[ ! $1 =~ ^sfx$|^primo$ ]]
then
  echo "Enter a stage sfx|primo"
  echo usage
  exit
fi

if [ -z "$2" ] || [[ ! $2 =~ ^create$|^update$ ]]
then
  echo "Enter a deploy type create|update "
  echo usage
  exit
fi

if [ $stage = "sfx" ]
then
  export PASSTHROUGH_URL="https://sfx-ndu.hosted.exlibrisgroup.com"
else
  export PASSTHROUGH_URL="http://onesearch.library.nd.edu"
fi

echo $PASSTHROUGH_URL
echo $(which hesdeploy)
echo hesdeploy -s $stage --$deployType $hesdeploy_extra

if $(hesdeploy -s $stage --$deployType $hesdeploy_extra)
then
  printf "${GREEN} SUCCESS: $current_project ${NC} \n"
else
  printf "${RED} Failed to deploy ${NC} \n"
fi
