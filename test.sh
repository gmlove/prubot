#!/bin/bash - 
#===============================================================================
#
#          FILE: test.sh
# 
#         USAGE: ./test.sh 
# 
#   DESCRIPTION: 
# 
#       OPTIONS: ---
#  REQUIREMENTS: ---
#          BUGS: ---
#         NOTES: ---
#        AUTHOR: YOUR NAME (), 
#  ORGANIZATION: 
#       CREATED: 03/09/2018 12:44:17 CST
#      REVISION:  ---
#===============================================================================

set -o nounset                              # Treat unset variables as an error
SHOST=13.250.126.207:8080
curl -X POST -H 'Content-Type:application/json' $SHOST/message -d"{\"userId\":10}"  && sleep 1
echo
curl -X POST -H 'Content-Type:application/json' $SHOST/message -d"{\"text\":\"申請理賠\", \"userId\":10}"  && sleep 1
echo
curl -X POST -H 'Content-Type:application/json' $SHOST/message -d"{\"text\":\"faceid\", \"userId\":10}"  && sleep 1
echo
curl -X POST -H 'Content-Type:application/json' $SHOST/message -d"{\"text\":\"住院現金\", \"userId\":10}"  && sleep 1
echo
curl -X POST -H 'Content-Type:application/json' $SHOST/message -d"{\"text\":\"Policy 1: 1045678 for Chan Tai Man\", \"userId\":10}"  && sleep 1
echo
curl -X POST -H 'Content-Type:application/json' $SHOST/message -d"{\"text\":\"done\", \"type\": \"bill-info\", \"userId\":10}"  && sleep 1
echo
curl -X POST -H 'Content-Type:application/json' $SHOST/message -d"{\"text\":\"直接轉賬\",\"userId\":10}"  && sleep 1
echo
curl -X POST -H 'Content-Type:application/json' $SHOST/message -d"{\"text\":\"done\", \"type\": \"credit-card\", \"userId\":10}"  && sleep 1
echo
curl -X POST -H 'Content-Type:application/json' $SHOST/message -d"{\"text\":\"請我的保險顧問聯絡我。\", \"userId\":10}"  && sleep 1
echo

