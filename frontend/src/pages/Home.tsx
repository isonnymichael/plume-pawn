import React from "react"
import { motion } from "framer-motion"

const Home: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-[#F9F9F9] font-sans">

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 py-32 relative z-10">

      {/* Animated Abstract Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Top Left Blob */}
        <motion.div
          className="absolute w-[700px] h-[700px] top-[-250px] left-[-200px]"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 20, -20, 0],
            x: [0, 10, -10, 0],
            y: [0, 15, -15, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        >
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              fill="#EF4444"
              fillOpacity="0.2"
              d="M46.3,-60.1C59.6,-49.3,70.3,-34.3,71.3,-19.2C72.3,-4.1,63.6,11.1,55,26.5C46.4,42,38,57.7,24.4,64.3C10.8,70.9,-7.9,68.5,-24.1,60.6C-40.3,52.7,-53.8,39.2,-62.9,22.9C-72,6.7,-76.8,-12.2,-70.5,-27.3C-64.3,-42.4,-47.1,-53.8,-30.2,-62.3C-13.3,-70.7,3.3,-76.1,18.4,-72.6C33.5,-69.2,46.3,-56.6,46.3,-60.1Z"
              transform="translate(100 100)"
            />
          </svg>
        </motion.div>

        {/* Middle Right Blob */}
        <motion.div
          className="absolute w-[400px] h-[400px] top-[40%] right-[-150px]"
          animate={{
            scale: [1, 1.05, 0.95, 1],
            rotate: [0, -10, 10, 0],
            x: [0, -15, 15, 0],
            y: [0, 10, -10, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        >
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              fill="#EF4444"
              fillOpacity="0.15"
              d="M53.7,-62.5C68.7,-55.3,79.4,-36.8,77.5,-20.3C75.5,-3.8,60.8,10.7,50.7,24.6C40.6,38.5,35.1,51.8,25.7,58.3C16.3,64.7,3,64.3,-11.4,69.7C-25.7,75,-41.2,86.2,-50.1,79.3C-58.9,72.3,-61.2,47.1,-65.7,27.8C-70.2,8.5,-76.8,-4.9,-72.3,-17.7C-67.8,-30.4,-52.2,-42.4,-37.4,-49.4C-22.6,-56.5,-11.3,-58.6,4.3,-64.7C19.9,-70.8,39.9,-81.7,53.7,-62.5Z"
              transform="translate(100 100)"
            />
          </svg>
        </motion.div>

        {/* Bottom Right Blob */}
        <motion.div
          className="absolute w-[500px] h-[500px] bottom-[-200px] right-[-150px]"
          animate={{
            scale: [1, 1.08, 0.95, 1],
            rotate: [0, 15, -15, 0],
            x: [0, -10, 10, 0],
            y: [0, -10, 10, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        >
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              fill="#EF4444"
              fillOpacity="0.1"
              d="M38.7,-58.9C48.5,-49.2,52.8,-34.3,56.7,-20.7C60.5,-7.1,64,5.1,63.3,21.1C62.7,37.1,57.9,56.9,45.6,66.1C33.3,75.3,13.7,74,-2.6,69.5C-19,65,-31.9,57.4,-43.7,47.6C-55.4,37.8,-66.1,25.8,-66.9,13C-67.7,0.2,-58.7,-13.4,-49.7,-23.8C-40.7,-34.3,-31.7,-41.5,-21.2,-50.5C-10.7,-59.4,1.3,-70.1,13.7,-72.6C26,-75.1,38.7,-69.3,38.7,-58.9Z"
              transform="translate(100 100)"
            />
          </svg>
        </motion.div>
      </div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6"
        >
          Unlock Liquidity from Real-World Assets
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-lg md:text-xl text-gray-700 max-w-2xl mb-8"
        >
          Pinjam is the gateway to fast, permissionless loans using your physical assets as collateral — all powered by the Plume Network.
        </motion.p>

        <motion.a
          href="https://plumenetwork.xyz"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-red-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg transition-all"
        >
          Explore Plume →
        </motion.a>
      </section>

      {/* Trusted Logos */}
      <section className="py-16 px-6 bg-white text-center">
        <h2 className="text-2xl font-bold mb-8">Backed by Web3 Leaders</h2>
        <div className="flex justify-center items-center flex-wrap gap-10 opacity-70">
          <img src="/plume-logo.svg" alt="Plume" className="h-10" />
          <div className="w-[100px] h-[40px] bg-gray-200 rounded animate-pulse" />
          <div className="w-[100px] h-[40px] bg-gray-200 rounded animate-pulse" />
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-[#f9f9f9] relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Why Choose Pinjam?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "RWA Tokenization",
                desc: "Turn tangible items into tradable digital assets with zero friction.",
              },
              {
                title: "Instant Loans",
                desc: "Access liquidity in seconds using tokenized collateral.",
              },
              {
                title: "Smart Contract-Driven",
                desc: "Fully automated, transparent, and trustless loan lifecycle.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-all"
              >
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-white text-center">
        <h2 className="text-3xl font-bold mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          {[
            {
              step: "1. Tokenize",
              desc: "Submit proof of ownership for your physical asset. We’ll mint it as a unique RWA NFT.",
            },
            {
              step: "2. Get a Loan",
              desc: "Use your NFT as collateral to instantly borrow stablecoins via smart contracts.",
            },
            {
              step: "3. Repay & Reclaim",
              desc: "Repay the loan and automatically retrieve your NFT-backed ownership rights.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.3 }}
              className="p-6 bg-gray-50 rounded shadow"
            >
              <h3 className="text-xl font-bold mb-3">{item.step}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-red-500 text-white py-24 px-6 text-center">
        <h2 className="text-4xl font-bold mb-6">Start Unlocking Real Value</h2>
        <p className="text-lg max-w-xl mx-auto mb-8">
          Join a growing ecosystem of asset owners and liquidity providers bridging the real and digital economy.
        </p>
        <a
          href="#"
          className="bg-white text-red-500 px-8 py-4 font-semibold rounded-full hover:bg-red-100 transition"
        >
          Get Started →
        </a>
      </section>
    </div>
  )
}

export default Home
