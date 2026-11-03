#!/bin/bash
set -euo pipefail

# lancer dans conteneur : 
#   move-messages.sh jurinorm.nlp.ner.done.fail nlp.ner.done
# lancer hors conteneur :
#   docker exec rabbitmq /scripts/move-messages.sh jurinorm.nlp.ner.done.fail nlp.ner.done

SOURCE="${1:-}"
DEST="${2:-}"
SHOVEL_NAME="move-$$"

if [[ -z "$SOURCE" || -z "$DEST" ]]; then
  echo "Usage: docker exec rabbitmq /scripts/move-messages.sh <source-queue> <dest-queue>"
  exit 1
fi

# Compter les messages à déplacer
MSG_COUNT=$(rabbitmqctl list_queues name messages 2>/dev/null \
  | awk -v q="$SOURCE" '$1 == q { print $2 }')

if [[ -z "$MSG_COUNT" || "$MSG_COUNT" -eq 0 ]]; then
  echo "La queue '$SOURCE' est vide ou inexistante. Rien à déplacer."
  exit 0
fi

echo "-> $MSG_COUNT messages à déplacer de '$SOURCE' vers '$DEST'"

# Créer le Shovel éphémère
rabbitmqctl set_parameter shovel "$SHOVEL_NAME" \
  "{\"src-protocol\": \"amqp091\",
    \"src-uri\": \"amqp://\",
    \"src-queue\": \"$SOURCE\",
    \"dest-protocol\": \"amqp091\",
    \"dest-uri\": \"amqp://\",
    \"dest-queue\": \"$DEST\",
    \"src-delete-after\": \"queue-length\"}"

echo "-> Shovel '$SHOVEL_NAME' créé. Transfert en cours..."

# Attendre l'auto-suppression du Shovel
TIMEOUT=120
ELAPSED=0
while rabbitmqctl list_parameters 2>/dev/null | grep -q "$SHOVEL_NAME"; do
  if [[ $ELAPSED -ge $TIMEOUT ]]; then
    echo "Timeout : le Shovel n'a pas terminé après ${TIMEOUT}s."
    rabbitmqctl clear_parameter shovel "$SHOVEL_NAME" || true
    exit 1
  fi
  sleep 2
  ELAPSED=$((ELAPSED + 2))
done

# Bilan
REMAINING=$(rabbitmqctl list_queues name messages 2>/dev/null \
  | awk -v q="$SOURCE" '$1 == q { print $2 }')
DEST_COUNT=$(rabbitmqctl list_queues name messages 2>/dev/null \
  | awk -v q="$DEST" '$1 == q { print $2 }')

echo "-> Terminé."
echo "   '$SOURCE' : ${REMAINING:-0} messages restants"
echo "   '$DEST'   : ${DEST_COUNT:-0} messages"
