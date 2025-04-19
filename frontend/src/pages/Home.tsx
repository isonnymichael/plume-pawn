import React from "react"

const Home: React.FC = () => {
  return (
    <div className="bg-[#F9F9F9] min-h-screen">
      <section className="bg-white text-black py-32 px-6 text-center font-sans">
        <h1 className="text-4xl font-bold mb-4">Pawn Real Assets, Instantly</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
          Tokenize and borrow against your physical assets in seconds.
          Backed by Plume Network’s RWA tokenization,
          Plume Pawn brings real-world value to the blockchain.
        </p>
        <a
          href="https://plumenetwork.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-red-500 text-white px-6 py-3 rounded font-semibold"
        >
          Learn More →
        </a>
      </section>

      <section className="bg-[#F9F9F9] py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-10">Why Use Plume Pawn?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded shadow">
              <h3 className="font-semibold mb-2">RWA Tokenization</h3>
              <p className="text-sm text-gray-600">
                Securely tokenize real-world items into NFTs.
              </p>
            </div>
            <div className="bg-white p-6 rounded shadow">
              <h3 className="font-semibold mb-2">Instant Loans</h3>
              <p className="text-sm text-gray-600">
                Borrow stablecoins using tokenized assets.
              </p>
            </div>
            <div className="bg-white p-6 rounded shadow">
              <h3 className="font-semibold mb-2">Smart Contract-Based</h3>
              <p className="text-sm text-gray-600">
                Trustless, automated loan lifecycle.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home