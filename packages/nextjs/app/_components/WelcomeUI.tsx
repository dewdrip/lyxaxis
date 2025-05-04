import { FC } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRightIcon, CubeIcon, DocumentCheckIcon, UserGroupIcon, WalletIcon } from "@heroicons/react/24/outline";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: FC<FeatureCardProps> = ({ icon, title, description }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="flex flex-col items-center p-6 bg-base-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
  >
    <div className="w-12 h-12 mb-4 text-primary">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-center text-base-content/80">{description}</p>
  </motion.div>
);

export default function WelcomeUI() {
  const features = [
    {
      icon: <CubeIcon className="w-full h-full" />,
      title: "Clone Multi-sig",
      description: "Create your own multi-signature wallet with just one click",
    },
    {
      icon: <UserGroupIcon className="w-full h-full" />,
      title: "DAO Management",
      description: "Manage your DAO with ease through our intuitive dashboard",
    },
    {
      icon: <DocumentCheckIcon className="w-full h-full" />,
      title: "Proposal System",
      description: "Create, sign, and execute proposals seamlessly",
    },
    {
      icon: <WalletIcon className="w-full h-full" />,
      title: "Asset Management",
      description: "Track and manage your digital assets in one place",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-base-100 to-base-200">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Welcome to Lyxaxis
          </h1>
          <p className="text-xl text-base-content/80 max-w-2xl mx-auto">
            The multi-signature wallet for universal business profiles - DAOs!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col items-center gap-6 mb-16"
        >
          <Link href="/createmultisig" className="btn btn-primary btn-lg group">
            Get Started
            <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="flex flex-col gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 text-center text-base-content/60"
        >
          <p>Join our community of DAOs and start managing your assets securely today!</p>
        </motion.div>
      </div>
    </div>
  );
}
