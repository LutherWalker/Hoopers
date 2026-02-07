import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowRight, Trophy, Users, Zap } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-accent">🏀</div>
            <span className="text-xl font-bold tracking-tight">HOOPERS VIBES</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/results")}
              className="text-sm"
            >
              Résultats
            </Button>
            <Button
              onClick={() => navigate("/vote")}
              className="btn-neon"
            >
              Voter
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Background gradient effect */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container flex flex-col items-center justify-center text-center">
          {/* Logo */}
          <div className="mb-8 text-8xl md:text-9xl animate-bounce">🏀</div>

          {/* Title */}
          <h1 className="mb-4 text-5xl md:text-7xl font-bold tracking-tighter">
            HOOPERS
            <span className="block text-accent">VIBES</span>
          </h1>

          {/* Subtitle */}
          <p className="mb-8 max-w-2xl text-lg md:text-xl text-muted-foreground">
            Votez pour le MVP de l'événement basketball le plus attendu de l'année.
            Chaque vote compte, chaque voix compte.
          </p>

          {/* CTA Button */}
          <Button
            onClick={() => navigate("/vote")}
            size="lg"
            className="btn-neon mb-12 text-base md:text-lg h-12 md:h-14 px-8 md:px-12"
          >
            Voter pour le MVP
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full mt-16">
            <div className="player-card p-6 md:p-8">
              <Trophy className="h-12 w-12 text-accent mb-4 mx-auto" />
              <h3 className="text-lg font-bold mb-2">Élisez le MVP</h3>
              <p className="text-sm text-muted-foreground">
                Votez pour votre joueur préféré et aidez à élire le meilleur joueur de l'événement.
              </p>
            </div>

            <div className="player-card p-6 md:p-8">
              <Users className="h-12 w-12 text-accent mb-4 mx-auto" />
              <h3 className="text-lg font-bold mb-2">Sécurisé</h3>
              <p className="text-sm text-muted-foreground">
                Un seul vote par appareil. Système anti-triche pour garantir l'équité.
              </p>
            </div>

            <div className="player-card p-6 md:p-8">
              <Zap className="h-12 w-12 text-accent mb-4 mx-auto" />
              <h3 className="text-lg font-bold mb-2">Résultats en Direct</h3>
              <p className="text-sm text-muted-foreground">
                Consultez les résultats en temps réel et suivez le classement des joueurs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-border py-16 md:py-24 bg-card/50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">100%</div>
              <p className="text-muted-foreground">Transparence</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">Sécurisé</div>
              <p className="text-muted-foreground">Anti-triche avancé</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">En Direct</div>
              <p className="text-muted-foreground">Résultats temps réel</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-background/50">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 HOOPERS VIBES. Tous les droits réservés.
          </p>
          <div className="flex gap-4">
            <Button variant="ghost" size="sm">
              À propos
            </Button>
            <Button variant="ghost" size="sm">
              Contact
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
