export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-6 space-y-6">
      <h1 className="text-2xl font-bold text-orange-700">Nous contacter</h1>
      <p className="text-gray-600">
        Vous pouvez nous envoyer vos questions, suggestions ou demandes via le formulaire ci-dessous.
      </p>

      <form className="space-y-4">
        <div className="flex flex-col">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">Nom</label>
          <input
            id="name"
            type="text"
            placeholder="Votre nom"
            className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Votre email"
            className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="message" className="text-sm font-medium text-gray-700">Message</label>
          <textarea
            id="message"
            placeholder="Votre message"
            rows={5}
            className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <button
          type="submit"
          className="bg-orange-700 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-md"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
