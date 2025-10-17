/* eslint-disable deprecation/deprecation */
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Github,
  MessageCircle,
  MessageCircleWarning,
  Zap,
  Shield,
  Heart,
  Upload,
  BarChart3,
  Eye,
  Users,
  Star,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Chesskit - Free Chess Game Analysis | Analyze Chess.com & Lichess Games",
  description:
    "Analyze your chess games for free with Chesskit. Support for Chess.com, Lichess, and PGN / FEN. No ads, no subscriptions, open-source and privacy-focused.",
  keywords:
    "chess analysis, free chess analyzer, chess.com analysis, lichess analysis, PGN analysis, chess improvement, chess tools, open source chess",
  authors: [{ name: "Chesskit Team" }],
  openGraph: {
    title: "Chesskit - Free Chess Game Analysis",
    description:
      "Analyze your chess games for free. Support for Chess.com, Lichess, and PGN files. No ads, no subscriptions.",
    type: "website",
    url: "https://chesskit.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chesskit - Free Chess Game Analysis",
    description:
      "Analyze your chess games for free. Support for Chess.com, Lichess, and PGN files.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ChessKitLanding() {
  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <header className="border-b border-[#2e2e30] bg-[#121212]/95 backdrop-blur supports-[backdrop-filter]:bg-[#121212]/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src="/android-chrome-192x192.png"
              alt="Chesskit Icon"
              className="w-8 h-8"
            />
            <span className="text-xl font-bold">Chesskit</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="#features"
              className="text-gray-300 hover:text-[#3b9ac6] transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-gray-300 hover:text-[#3b9ac6] transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#community"
              className="text-gray-300 hover:text-[#3b9ac6] transition-colors"
            >
              Community
            </Link>
            <Button asChild className="text-white bg-[#3b9ac6] hover:bg-[#3b9ac6]/90">
              <Link href="/analysis">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <div className="flex justify-center mb-12">
              <Badge
                variant="secondary"
                className="bg-[#2e2e30] text-[#3b9ac6] border-[#3b9ac6]/20 mb-8"
              >
                <Star className="w-4 h-4 mr-1" />
                Free & Open Source
              </Badge>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Analyze Your Chess Games
              <span className="block text-[#3b9ac6]">Like a Grandmaster</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              <br></br>
              Support for{" "}
              <Link
                href="https://www.chess.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3b9ac6] hover:underline"
              >
                Chess.com
              </Link>
              ,{" "}
              <Link
                href="https://lichess.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3b9ac6] hover:underline"
              >
                Lichess
              </Link>
              , FEN, and PGN files. No ads, no subscriptions, no hidden costs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-[#3b9ac6] hover:bg-[#3b9ac6]/90 text-white px-8 py-3 text-lg"
                asChild
              >
                <Link href="/analysis">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Start Analyzing
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-[#2e2e30] text-gray-300 hover:bg-[#2e2e30] px-8 py-3 text-lg"
                asChild
              >
                <Link
                  href="https://github.com/GuillaumeSD/Chesskit"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-5 h-5 mr-2" />
                  View on GitHub
                </Link>
              </Button>
            </div>
            <br></br>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-[#3b9ac6]">100%</div>
                <div className="text-gray-400">Free Forever</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#3b9ac6]">0</div>
                <div className="text-gray-400">Ads or Tracking</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#3b9ac6]">∞</div>
                <div className="text-gray-400">Game Analysis</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 bg-[#2e2e30]/20">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Why Choose Chesskit?</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Built by chess players, for chess players. Every feature
                designed to help you improve your game.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-[#2e2e30] border-[#2e2e30] hover:border-[#3b9ac6]/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-[#3b9ac6]/20 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-[#3b9ac6]" />
                  </div>
                  <CardTitle className="text-white">
                    Lightning Fast Analysis
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Get instant analysis of your games with parallelized{" "}
                    <Link
                      href="https://stockfishchess.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3b9ac6] hover:underline"
                    >
                      Stockfish
                    </Link>{" "}
                    evaluation. 
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-[#2e2e30] border-[#2e2e30] hover:border-[#3b9ac6]/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-[#3b9ac6]/20 rounded-lg flex items-center justify-center mb-4">
                    <Upload className="w-6 h-6 text-[#3b9ac6]" />
                  </div>
                  <CardTitle className="text-white">
                    Multiple Platforms
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Import games from{" "}
                    <Link
                      href="https://www.chess.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3b9ac6] hover:underline"
                    >
                      Chess.com
                    </Link>
                    ,{" "}
                    <Link
                      href="https://lichess.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3b9ac6] hover:underline"
                    >
                      Lichess.org
                    </Link>
                    , or upload your own PGN files seamlessly.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-[#2e2e30] border-[#2e2e30] hover:border-[#3b9ac6]/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-[#3b9ac6]/20 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-[#3b9ac6]" />
                  </div>
                  <CardTitle className="text-white">Privacy First</CardTitle>
                  <CardDescription className="text-gray-400">
                    Your data stays yours. We don't collect personal information
                    beyond monitoring. No account required.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-[#2e2e30] border-[#2e2e30] hover:border-[#3b9ac6]/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-[#3b9ac6]/20 rounded-lg flex items-center justify-center mb-4">
                    <Heart className="w-6 h-6 text-[#3b9ac6]" />
                  </div>
                  <CardTitle className="text-white">No Hidden Costs</CardTitle>
                  <CardDescription className="text-gray-400">
                    Completely free forever. No subscriptions, no premium tiers,
                    no surprise charges.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-[#2e2e30] border-[#2e2e30] hover:border-[#3b9ac6]/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-[#3b9ac6]/20 rounded-lg flex items-center justify-center mb-4">
                    <Github className="w-6 h-6 text-[#3b9ac6]" />
                  </div>
                  <CardTitle className="text-white">Open Source</CardTitle>
                  <CardDescription className="text-gray-400">
                    Transparent, community-driven development. Contribute,
                    suggest features, or fork the project.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-[#2e2e30] border-[#2e2e30] hover:border-[#3b9ac6]/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-[#3b9ac6]/20 rounded-lg flex items-center justify-center mb-4">
                    <Eye className="w-6 h-6 text-[#3b9ac6]" />
                  </div>
                  <CardTitle className="text-white">
                    Ad-Free Experience
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Focus on improving your chess without distractions. Clean,
                    minimal interface.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Get started in three simple steps. No registration required.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#3b9ac6] rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-4">Import Your Game</h3>
                <p className="text-gray-400">
                  Upload a PGN / FEN or paste your game URL from{" "}
                  <Link
                    href="https://www.chess.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3b9ac6] hover:underline"
                  >
                    Chess.com
                  </Link>{" "}
                  or{" "}
                  <Link
                    href="https://lichess.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3b9ac6] hover:underline"
                  >
                    Lichess
                  </Link>
                  .
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#3b9ac6] rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-4">Get Analysis</h3>
                <p className="text-gray-400">
                  <Link
                    href="https://stockfishchess.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3b9ac6] hover:underline"
                  >
                    Stockfish
                  </Link>{" "}
                  engine analyzes every move, highlighting mistakes and missed
                  opportunities.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#3b9ac6] rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-4">
                  Improve Your Game
                </h3>
                <p className="text-gray-400">
                  Study the suggestions and learn from your mistakes to become a
                  stronger player.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section id="community" className="py-20 px-4 bg-[#2e2e30]/20">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Join Our Community</h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Connect with fellow chess enthusiasts, contribute to the project,
              and help shape the future of Chesskit.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                size="lg"
                variant="outline"
                className="border-[#3b9ac6] text-[#3b9ac6] hover:bg-[#3b9ac6] hover:text-white px-8 py-3"
                asChild
              >
                <Link
                  href="https://github.com/GuillaumeSD/Chesskit"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-5 h-5 mr-2" />
                  Star on GitHub
                </Link>
              </Button>
              <Button
                size="lg"
                className="bg-[#3b9ac6] hover:bg-[#3b9ac6]/90 px-8 py-3"
                asChild
              >
                <Link
                  href="https://discord.gg/NAtPPqZpFN"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Join Discord
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-[#3b9ac6] text-[#3b9ac6] hover:bg-[#3b9ac6] hover:text-white px-8 py-3"
                asChild
              >
                <Link
                  href="https://tally.so/r/3x7OLy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircleWarning className="w-5 h-5 mr-2" />
                  Give a Feedback
                </Link>
              </Button>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card className="bg-[#2e2e30] border-[#2e2e30]">
                <CardHeader className="text-center">
                  <Github className="w-8 h-8 text-[#3b9ac6] mx-auto mb-2" />
                  <CardTitle className="text-white">Open Source</CardTitle>
                  <CardDescription className="text-gray-400">
                    Contribute code, report bugs, or suggest new features on our {" "}
                    <Link
                    href="https://github.com/GuillaumeSD/Chesskit"
                    target="_blank"
                    className="text-[#3b9ac6] hover:underline"
                  >
                    GitHub
                  </Link> repository.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-[#2e2e30] border-[#2e2e30]">
                <CardHeader className="text-center">
                  <Users className="w-8 h-8 text-[#3b9ac6] mx-auto mb-2" />
                  <CardTitle className="text-white">
                    Community Support
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Get help, share tips, and discuss chess strategy with our
                    friendly community on {" "}
                    <Link
                    href="https://discord.gg/NAtPPqZpFN"
                    target="_blank"
                    className="text-[#3b9ac6] hover:underline"
                  >
                    Discord
                  </Link>.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-[#2e2e30] border-[#2e2e30]">
                <CardHeader className="text-center">
                  <Heart className="w-8 h-8 text-[#3b9ac6] mx-auto mb-2" />
                  <CardTitle className="text-white">
                   Community driven
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    We would be happy to hear your {" "}
                    <Link
                    href="https://tally.so/r/3x7OLy"
                    target="_blank"
                    className="text-[#3b9ac6] hover:underline"
                  >
                    feedback
                  </Link> and suggestions.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="get-started" className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Improve Your Chess?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Start analyzing your games today. No signup required, completely
              free forever.
            </p>
            <Button
              size="lg"
              className="bg-[#3b9ac6] hover:bg-[#3b9ac6]/90 text-white px-12 py-4 text-lg"
              asChild
            >
              <Link href="/analysis">
              <BarChart3 className="w-6 h-6 mr-2" />
              Analyze Your First Game
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2e2e30] py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img
                src="/android-chrome-192x192.png"
                alt="Chesskit Icon"
                className="w-8 h-8"
              />
              <span className="text-xl font-bold">Chesskit</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                href="https://github.com/GuillaumeSD/Chesskit"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#3b9ac6] transition-colors"
              >
                <Github className="w-5 h-5" />
              </Link>
              <Link
                href="https://discord.gg/NAtPPqZpFN"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#3b9ac6] transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-[#2e2e30] text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} Chesskit. Open source and free
              forever.
            </p>
            <p className="mt-2 text-sm">
              No data collection beyond monitoring. Your privacy is our
              priority.
            </p>
            <p className="mt-4 text-xs">
              Powered by{" "}
              <Link
                href="https://stockfishchess.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3b9ac6] hover:underline"
              >
                Stockfish
              </Link>
              . Not affiliated with{" "}
              <Link
                href="https://www.chess.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3b9ac6] hover:underline"
              >
                Chess.com
              </Link>{" "}
              or{" "}
              <Link
                href="https://lichess.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3b9ac6] hover:underline"
              >
                Lichess.org
              </Link>
              <p className="mt-4 text-xs">
                Landing page built with ❤️ by               <Link
                href="https://github.com/Armitryx"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3b9ac6] hover:underline"
              >
                Armitryx
              </Link>
              </p>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
