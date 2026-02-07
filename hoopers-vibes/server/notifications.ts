import { notifyOwner } from "./_core/notification";

/**
 * Envoie une notification au propriétaire lors d'un nouveau vote
 */
export async function notifyNewVote(playerName: string, playerTeam: string, totalVotes: number) {
  try {
    const success = await notifyOwner({
      title: "🏀 Nouveau vote enregistré",
      content: `${playerName} (${playerTeam}) a reçu un vote. Total: ${totalVotes} votes`,
    });
    return success;
  } catch (error) {
    console.error("Erreur lors de l'envoi de la notification:", error);
    return false;
  }
}

/**
 * Envoie une notification au propriétaire quand un seuil de votes est atteint
 */
export async function notifyVoteThreshold(threshold: number, playerName: string, voteCount: number) {
  try {
    const success = await notifyOwner({
      title: `🎯 Seuil de ${threshold} votes atteint!`,
      content: `${playerName} a atteint ${voteCount} votes!`,
    });
    return success;
  } catch (error) {
    console.error("Erreur lors de l'envoi de la notification:", error);
    return false;
  }
}

/**
 * Envoie une notification au propriétaire avec le résumé des résultats
 */
export async function notifyResultsSummary(topPlayer: string, totalVotes: number, playerCount: number) {
  try {
    const success = await notifyOwner({
      title: "📊 Résumé des votes HOOPERS VIBES",
      content: `Leader: ${topPlayer} | Total: ${totalVotes} votes | Joueurs: ${playerCount}`,
    });
    return success;
  } catch (error) {
    console.error("Erreur lors de l'envoi de la notification:", error);
    return false;
  }
}
