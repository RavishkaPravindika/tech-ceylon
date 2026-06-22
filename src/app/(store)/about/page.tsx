import type { Metadata } from 'next';
import { Shield, Users, Star, Zap, Award, HeartHandshake } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Tech Ceylon — Sri Lanka\'s premier tech product catalog and WhatsApp ordering platform.',
};

const VALUES = [
  { icon: Shield, title: 'Trust', description: 'Every product is verified for authenticity before listing.' },
  { icon: Star, title: 'Quality', description: 'We curate only premium, reliable tech products.' },
  { icon: Zap, title: 'Speed', description: 'Fast WhatsApp responses and quick order processing.' },
  { icon: HeartHandshake, title: 'Service', description: 'Personal customer service via WhatsApp at every step.' },
];

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-gradient rounded-3xl shadow-xl mb-6">
          <span className="text-white font-bold text-2xl">TC</span>
        </div>
        <h1 className="text-4xl font-poppins font-bold text-[var(--text-primary)] mb-4">
          About Tech Ceylon
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          We are Sri Lanka&apos;s premier technology product catalog — bringing premium electronics,
          accessories, and gadgets closer to you with the simplicity of WhatsApp ordering.
        </p>
      </div>

      {/* Story */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        <div>
          <h2 className="text-2xl font-poppins font-bold text-[var(--text-primary)] mb-4">Our Story</h2>
          <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
            <p>
              Tech Ceylon was founded with a simple mission: make quality technology products accessible
              to everyone in Sri Lanka, without the complexity of traditional e-commerce.
            </p>
            <p>
              We believe ordering tech products should be as simple as messaging a friend. That&apos;s why
              every order at Tech Ceylon is processed through WhatsApp — personal, direct, and hassle-free.
            </p>
            <p>
              From high-performance laptops to everyday accessories, our catalog is carefully curated
              to bring you the best value for your investment.
            </p>
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-3xl p-8">
          <h3 className="font-semibold text-[var(--text-primary)] mb-6">By the Numbers</h3>
          <div className="grid grid-cols-2 gap-6">
            {[
              { value: '200+', label: 'Products' },
              { value: '1,000+', label: 'Happy Customers' },
              { value: '24hr', label: 'Response Time' },
              { value: '100%', label: 'Genuine Products' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-gradient mb-1">{stat.value}</div>
                <div className="text-sm text-[var(--text-muted)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="mb-16">
        <h2 className="text-2xl font-poppins font-bold text-[var(--text-primary)] text-center mb-10">
          Our Values
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl text-center card-hover">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon size={22} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
