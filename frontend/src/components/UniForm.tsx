import React from 'react';

export default function UniForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (message: string) => Promise<void>;
  isLoading: boolean;
}) {
  const [input, setInput] = React.useState('');

  const submitForm = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input === '') return;

    try {
      await onSubmit(input);
      setInput('');
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <form
      onSubmit={submitForm}
      className="flex justify-items-center w-max mx-auto items-center mt-10"
    >
      <input
        disabled={isLoading}
        value={input}
        placeholder="Enter a cool message for me"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
        className={`border-2 focus:outline-none focus:border-fuchsia-600 w-64 px-4 py-3 sm:text-md border-fuchsia-300 rounded-md ${
          isLoading ? 'text-gray-400' : 'text-gray-600'
        }`}
      />

      <button
        disabled={isLoading || input === ''}
        type="submit"
        className={`ml-10 w-36 py-3 rounded-md text-bold text-fuchsia-700 bg-white border-2 border-fuchsia-600 hover:border-fuchsia-800 hover:text-fuchsia-800 ${
          isLoading || input === ''
            ? 'cursor-not-allowed border-fuchsia-300 hover:border-fuchsia-300 text-fuchsia-400 hover:text-fuchsia-400'
            : ''
        }`}
      >
        {isLoading ? (
          <div className="mx-auto loader ease-linear rounded-full border-2 border-t-2 border-gray-200 h-6 w-6" />
        ) : (
          'Send it 🦄'
        )}
      </button>
    </form>
  );
}
