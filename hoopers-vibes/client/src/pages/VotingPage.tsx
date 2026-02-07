import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ArrowLeft, Heart, CheckCircle2 } from "lucide-react";
import { Player } from "../../../drizzle/schema";

export default function VotingPage() {
  const [, navigate] = useLocation();
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>("");
  const [hasVoted, setHasVoted] = useState(false);
  const [votedPlayerId, setVotedPlayerId] = useState<number | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Fetch players
  const { data: players, isLoading } = trpc.voting.getPlayers.useQuery();

  // Vote mutation
  const voteMutation = trpc.voting.vote.useMutation({
    onSuccess: (data, variables) => {
      setHasVoted(true);
      setVotedPlayerId(variables.playerId);
      setShowConfirmation(true);
      toast.success(data.message);
      setTimeout(() => {
        navigate("/results");
      }, 2000);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Check if voted query
  const checkIfVotedQuery = trpc.voting.checkIfVoted.useQuery(
    { deviceFingerprint: deviceFingerprint || "" },
    { enabled: !!deviceFingerprint }
  );

  useEffect(() => {
    if (checkIfVotedQuery.data?.hasVoted) {
      setHasVoted(true);
    }
  }, [checkIfVotedQuery.data?.hasVoted]);

  // Generate device fingerprint on mount
  useEffect(() => {
    const generateFingerprint = async () => {
      // Create a fingerprint from user agent and other browser data
      const userAgent = navigator.userAgent;
      const language = navigator.language;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const screen = `${window.screen.width}x${window.screen.height}`;

      const fingerprintData = `${userAgent}|${language}|${timezone}|${screen}`;
      const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(fingerprintData));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

      setDeviceFingerprint(hashHex);
    };

    generateFingerprint();
  }, []);

  const handleVote = (playerId: number) => {
    if (!deviceFingerprint) {
      toast.error("Erreur lors de la génération de l'empreinte appareil");
      return;
    }

    voteMutation.mutate({
      playerId,
      deviceFingerprint,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour
          </Button>
          <div className="text-lg font-bold">HOOPERS VIBES - Vote</div>
          <div className="w-20"></div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-12 md:py-20">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl md:text-5xl font-bold">Votez pour le MVP</h1>
          <p className="text-lg text-muted-foreground">
            Sélectionnez votre joueur préféré ci-dessous
          </p>
        </div>

        {/* Already Voted Message */}
        {hasVoted && !showConfirmation && (
          <div className="mb-8 p-6 bg-card border border-border rounded-lg text-center">
            <Heart className="h-8 w-8 text-accent mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-2">Vous avez déjà voté</h3>
            <p className="text-muted-foreground mb-4">
              Un seul vote par appareil est autorisé. Consultez les résultats en direct.
            </p>
            <Button onClick={() => navigate("/results")} className="btn-neon">
              Voir les résultats
            </Button>
          </div>
        )}

        {/* Confirmation Message */}
        {showConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-xl p-8 md:p-12 text-center max-w-md mx-4">
              <CheckCircle2 className="h-16 w-16 text-accent mx-auto mb-4 animate-bounce" />
              <h2 className="text-2xl font-bold mb-2">Vote enregistré !</h2>
              <p className="text-muted-foreground mb-6">
                Merci de votre participation. Redirection vers les résultats...
              </p>
            </div>
          </div>
        )}

        {/* Players Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="player-card animate-pulse">
                <div className="player-card-image bg-muted/50"></div>
                <div className="player-card-content">
                  <div className="h-4 bg-muted/50 rounded mb-3 w-3/4"></div>
                  <div className="h-3 bg-muted/50 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : players && players.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {players.map((player: Player) => (
              <div key={player.id} className="group player-card overflow-hidden">
                {/* Player Image */}
                <div className="player-card-image">
                  {player.imageUrl ? (
                    <img
                      src={player.imageUrl}
                      alt={player.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-accent/5">
                      <div className="text-6xl">🏀</div>
                    </div>
                  )}
                  {/* Jersey Number Overlay */}
                  <div className="absolute top-4 right-4 bg-accent/90 text-accent-foreground rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                    {player.number || "—"}
                  </div>
                </div>

                {/* Player Info */}
                <div className="player-card-content">
                  <h3 className="text-xl md:text-2xl font-bold mb-1 truncate">
                    {player.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">{player.team}</p>
                  {player.position && (
                    <p className="text-xs text-accent font-semibold mb-4 uppercase tracking-wide">
                      {player.position}
                    </p>
                  )}

                  {/* Vote Button */}
                  <Button
                    onClick={() => handleVote(player.id)}
                    disabled={hasVoted || voteMutation.isPending}
                    className="w-full btn-neon"
                  >
                    {voteMutation.isPending ? "Vote en cours..." : "Voter"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              Aucun joueur disponible pour le vote
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-background/50 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Un seul vote par appareil • Système sécurisé anti-triche</p>
        </div>
      </footer>
    </div>
  );
}
