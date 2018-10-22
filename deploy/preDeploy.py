import os
from hesburgh import scriptutil, heslog

def gitVersion(stage):
  rev = scriptutil.executeCommand('git rev-parse --short HEAD')
  if rev.get("code") != 0:
    # there was an error, return the stage name
    heslog.warn("Couldn't get git rev %s" % rev)
    return stage
  return rev.get("output").strip()


def runTests():
  heslog.info("Running tests")
  os.environ["CI"] = "Local"
  scriptutil.executeCommand('cd .. && yarn')
  output = scriptutil.executeCommand("cd .. && yarn test")
  return output.get("code") == 0


def run(stage):
  heslog.info("Running setup")
  # scriptutil.executeCommand('cd .. && ./setup.sh')

  # if not runTests():
  #   return { "error": "Tests failed" }
  # gitVersion(stage)
  return { "env": { "GIT_VERSION": "dev" } }
