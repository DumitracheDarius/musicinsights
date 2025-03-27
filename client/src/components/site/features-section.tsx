import { BarChart3, Users, MessageCircle } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconColor: string;
  bgColor: string;
}

function FeatureCard({ icon, title, description, iconColor, bgColor }: FeatureCardProps) {
  return (
    <div className="bg-card/50 p-6 rounded-lg backdrop-blur-sm border border-neutral-800/50 hover:border-neutral-700/50 transition-all">
      <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center mb-4`}>
        <div className={iconColor}>{icon}</div>
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-neutral-400 text-sm">{description}</p>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <div className="max-w-5xl mx-auto mt-24 px-6 w-full">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-light mb-4">Why Choose SongScape Analytics</h2>
        <p className="text-neutral-400 max-w-2xl mx-auto">
          Our platform delivers comprehensive music analytics to help artists, producers, and labels make data-driven decisions.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<BarChart3 className="h-5 w-5" />}
          title="Performance Metrics"
          description="Track streams, engagement, and growth patterns across all major platforms."
          iconColor="text-primary"
          bgColor="bg-primary/20"
        />
        
        <FeatureCard 
          icon={<Users className="h-5 w-5" />}
          title="Audience Analysis"
          description="Understand your listeners with demographic data and listening behavior insights."
          iconColor="text-accent"
          bgColor="bg-accent/20"
        />
        
        <FeatureCard 
          icon={<MessageCircle className="h-5 w-5" />}
          title="Sentiment Analysis"
          description="Analyze listener feedback and reviews to gauge audience reception."
          iconColor="text-primary"
          bgColor="bg-primary/20"
        />
      </div>
    </div>
  );
}
