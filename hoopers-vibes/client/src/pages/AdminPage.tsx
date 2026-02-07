import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ArrowLeft, Lock, Trash2, Plus, LogOut } from "lucide-react";

const ADMIN_PASSWORD = "hoopers2026"; // À remplacer par une vraie authentification

export default function AdminPage() {
  const [, navigate] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [playerTeam, setPlayerTeam] = useState("");
  const [playerNumber, setPlayerNumber] = useState("");
  const [playerImageUrl, setPlayerImageUrl] = useState("");
  const [playerPosition, setPlayerPosition] = useState("");

  // Fetch results
  const { data: results, refetch } = trpc.voting.getResults.useQuery();

  // Mutations
  const resetVotesMutation = trpc.admin.resetVotes.useMutation({
    onSuccess: () => {
      toast.success("Tous les votes ont été réinitialisés");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const addPlayerMutation = trpc.admin.addPlayer.useMutation({
    onSuccess: () => {
      toast.success("Joueur ajouté avec succès");
      setPlayerName("");
      setPlayerTeam("");
      setPlayerNumber("");
      setPlayerImageUrl("");
      setPlayerPosition("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword("");
      toast.success("Authentification réussie");
    } else {
      toast.error("Mot de passe incorrect");
    }
  };

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName || !playerTeam) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    addPlayerMutation.mutate({
      name: playerName,
      team: playerTeam,
      imageUrl: playerImageUrl || undefined,
      position: playerPosition || undefined,
      number: playerNumber ? parseInt(playerNumber) : undefined,
    });
  };

  const handleResetVotes = () => {
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser tous les votes ?")) {
      resetVotesMutation.mutate();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <div className="player-card p-8">
            <div className="flex justify-center mb-6">
              <Lock className="h-12 w-12 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-2">Admin Panel</h1>
            <p className="text-center text-muted-foreground mb-6">
              Accès réservé aux administrateurs
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Mot de passe administrateur
                </label>
                <Input
                  type="password"
                  placeholder="Entrez le mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit" className="w-full btn-neon">
                Se connecter
              </Button>
            </form>

            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="w-full mt-4"
            >
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="text-lg font-bold">Admin Panel</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAuthenticated(false)}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Add Player */}
          <div className="lg:col-span-1">
            <div className="player-card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-accent" />
                Ajouter un joueur
              </h2>

              <form onSubmit={handleAddPlayer} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Nom *
                  </label>
                  <Input
                    placeholder="Nom du joueur"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Équipe *
                  </label>
                  <Input
                    placeholder="Équipe"
                    value={playerTeam}
                    onChange={(e) => setPlayerTeam(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Numéro
                  </label>
                  <Input
                    type="number"
                    placeholder="Numéro du maillot"
                    value={playerNumber}
                    onChange={(e) => setPlayerNumber(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Position
                  </label>
                  <Input
                    placeholder="Position (ex: Meneur)"
                    value={playerPosition}
                    onChange={(e) => setPlayerPosition(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    URL Image
                  </label>
                  <Input
                    placeholder="https://..."
                    value={playerImageUrl}
                    onChange={(e) => setPlayerImageUrl(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={addPlayerMutation.isPending}
                  className="w-full btn-neon"
                >
                  {addPlayerMutation.isPending ? "Ajout..." : "Ajouter"}
                </Button>
              </form>
            </div>

            {/* Reset Votes */}
            <div className="player-card p-6 mt-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-destructive" />
                Actions
              </h2>

              <Button
                onClick={handleResetVotes}
                disabled={resetVotesMutation.isPending}
                variant="destructive"
                className="w-full"
              >
                {resetVotesMutation.isPending ? "Réinitialisation..." : "Réinitialiser les votes"}
              </Button>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            <div className="player-card p-6">
              <h2 className="text-xl font-bold mb-6">Résultats des votes</h2>

              {results && results.players.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-accent">
                        {results.totalVotes}
                      </div>
                      <p className="text-xs text-muted-foreground">Votes totaux</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-accent">
                        {results.players.length}
                      </div>
                      <p className="text-xs text-muted-foreground">Joueurs</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-accent">
                        {results.players[0]?.name.split(" ")[0] || "—"}
                      </div>
                      <p className="text-xs text-muted-foreground">Leader</p>
                    </div>
                  </div>

                  {/* Players Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-2">Rang</th>
                          <th className="text-left py-2 px-2">Joueur</th>
                          <th className="text-left py-2 px-2">Équipe</th>
                          <th className="text-right py-2 px-2">Votes</th>
                          <th className="text-right py-2 px-2">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.players
                          .sort((a, b) => Number(b.voteCount) - Number(a.voteCount))
                          .map((player, index) => (
                            <tr key={player.id} className="border-b border-border/50 hover:bg-muted/30">
                              <td className="py-3 px-2 font-bold">
                                {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                              </td>
                              <td className="py-3 px-2">{player.name}</td>
                              <td className="py-3 px-2 text-muted-foreground">{player.team}</td>
                              <td className="py-3 px-2 text-right font-bold text-accent">
                                {player.voteCount}
                              </td>
                              <td className="py-3 px-2 text-right">{player.percentage}%</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Aucun vote enregistré
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
