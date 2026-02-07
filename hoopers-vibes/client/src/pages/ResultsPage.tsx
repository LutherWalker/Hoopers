import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, Trophy, TrendingUp } from "lucide-react";

interface PlayerWithVotes {
  id: number;
  name: string;
  team: string;
  imageUrl?: string | null;
  position?: string | null;
  number?: number | null;
  isActive: number;
  createdAt: Date;
  updatedAt: Date;
  voteCount: number;
  percentage: number;
}

export default function ResultsPage() {
  const [, navigate] = useLocation();
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch results
  const { data: results, isLoading, refetch } = trpc.voting.getResults.useQuery();

  // Auto-refresh results every 3 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetch();
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  const sortedPlayers = results?.players.sort((a, b) => Number(b.voteCount) - Number(a.voteCount)) || [];

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
          <div className="text-lg font-bold">Résultats en Direct</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? "Auto ✓" : "Manuel"}
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-12 md:py-20">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl md:text-5xl font-bold">Classement des Joueurs</h1>
          <p className="text-lg text-muted-foreground">
            {results?.totalVotes || 0} votes enregistrés
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="player-card p-6">
            <Trophy className="h-8 w-8 text-accent mb-2" />
            <div className="text-3xl font-bold mb-1">
              {sortedPlayers[0]?.name || "—"}
            </div>
            <p className="text-sm text-muted-foreground">
              {sortedPlayers[0]?.voteCount || 0} votes
            </p>
          </div>

          <div className="player-card p-6">
            <TrendingUp className="h-8 w-8 text-accent mb-2" />
            <div className="text-3xl font-bold mb-1">
              {results?.totalVotes || 0}
            </div>
            <p className="text-sm text-muted-foreground">Votes totaux</p>
          </div>

          <div className="player-card p-6">
            <div className="text-3xl font-bold mb-1">
              {sortedPlayers.length}
            </div>
            <p className="text-sm text-muted-foreground">Joueurs en lice</p>
          </div>
        </div>

        {/* Results Table */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="player-card p-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted/50 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted/50 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-muted/50 rounded w-1/3"></div>
                  </div>
                  <div className="w-20 h-6 bg-muted/50 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedPlayers.length > 0 ? (
          <div className="space-y-4">
            {sortedPlayers.map((player: PlayerWithVotes, index: number) => (
              <div key={player.id} className="player-card p-4 md:p-6">
                <div className="flex items-center gap-4 md:gap-6">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0
                        ? "bg-accent text-accent-foreground"
                        : index === 1
                        ? "bg-muted text-foreground"
                        : index === 2
                        ? "bg-muted/70 text-foreground"
                        : "bg-muted/50 text-muted-foreground"
                    }`}>
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                    </div>
                  </div>

                  {/* Player Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-lg md:text-xl font-bold truncate">
                          {player.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {player.team}
                          {player.position && ` • ${player.position}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl md:text-3xl font-bold text-accent">
                          {player.voteCount}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {player.percentage}%
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-accent to-accent/70 h-full transition-all duration-500"
                        style={{ width: `${player.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              Aucun vote enregistré pour le moment
            </p>
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-12 text-center">
          <Button
            onClick={() => refetch()}
            className="btn-neon"
          >
            Actualiser les résultats
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-background/50 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            {autoRefresh ? "Mise à jour automatique toutes les 3 secondes" : "Mise à jour manuelle"}
          </p>
        </div>
      </footer>
    </div>
  );
}
