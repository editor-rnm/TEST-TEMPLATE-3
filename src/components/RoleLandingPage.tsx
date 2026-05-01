import { useNavigate } from 'react-router-dom';
import { Film, Smartphone, ArrowRight } from 'lucide-react';

export function RoleLandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Operations Hub
          </h1>
          <p className="text-muted-foreground text-lg">
            Select your role to continue
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Creator Card */}
          <button
            onClick={() => navigate('/?role=creator&id=sofia')}
            className="group relative flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-left shadow-sm transition-all duration-200 hover:shadow-lg hover:border-primary/40 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
              <Film className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <span className="block text-xl font-bold text-foreground">I'm a Creator</span>
              <span className="block text-sm text-muted-foreground">Film &amp; create content</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </button>

          {/* VA Card */}
          <button
            onClick={() => navigate('/?role=va&id=demo')}
            className="group relative flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-left shadow-sm transition-all duration-200 hover:shadow-lg hover:border-primary/40 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <span className="block text-xl font-bold text-foreground">I'm a VA</span>
              <span className="block text-sm text-muted-foreground">Edit &amp; post content</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        </div>
      </div>
    </div>
  );
}
