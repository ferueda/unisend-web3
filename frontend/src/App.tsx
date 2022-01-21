import React from 'react';
import { ethers } from 'ethers';
import abi from './utils/UniPortal.json';
import UniForm from './components/UniForm';

interface Unis {
  sender: string;
  timestamp: Date;
  message: string;
}

function App() {
  const [account, setAccount] = React.useState<string>();
  const [ethereum, setEthereum] = React.useState<any>();

  const [isLoading, setIsLoading] = React.useState(false);
  const [unisReceived, setUnisReceived] = React.useState<Unis[]>([]);

  const contractAddress = '0xCFe188a5A614e3aCf8Fa63ae0A5F5463AFFf153b';
  const contractABI = abi.abi;

  const isAppReady = ethereum && account;

  React.useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      setIsLoading(true);

      try {
        const { ethereum } = window as any;

        if (!ethereum) {
          console.log("Ethereum object doesn't exist!");
          setIsLoading(false);
          return;
        }

        console.log('We have the ethereum object', ethereum);
        setEthereum((window as any).ethereum);

        const accounts = await ethereum.request({ method: 'eth_accounts' });

        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log('Found an authorized account:', account);
          setAccount(account);
        } else {
          console.log('No authorized account found');
        }
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    };

    checkIfWalletIsConnected();
  }, []);

  React.useEffect(() => {
    if (!ethereum) return;
    const getAllUnis = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const portalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const unis = await portalContract.getAllUnis();
        const cleanedUnis: Unis[] = [];

        unis.forEach((uni: any) => {
          cleanedUnis.push({
            sender: uni.sender,
            timestamp: new Date(uni.timestamp * 1000),
            message: uni.message,
          });
        });

        setUnisReceived(cleanedUnis);
      } catch (err) {
        console.log(err);
      }
    };

    getAllUnis();
  }, [ethereum, contractABI, contractAddress, account]);

  React.useEffect(() => {
    if (!ethereum) return;

    let portalContract: ethers.Contract;

    const onNewUni = (from: string, timestamp: number, message: string) => {
      console.log('NewUni', from, timestamp, message);
      setUnisReceived((prev) => [
        ...prev,
        {
          sender: from,
          timestamp: new Date(timestamp * 1000),
          message,
        },
      ]);
    };

    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    portalContract = new ethers.Contract(contractAddress, contractABI, signer);
    portalContract.on('NewUni', onNewUni);

    return () => {
      if (portalContract) {
        portalContract.off('NewUni', onNewUni);
      }
    };
  }, [contractABI, ethereum]);

  const connectWallet = async () => {
    if (!ethereum) {
      console.log("Ethereum object doesn't exist!");
      return;
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log('Connected', accounts[0]);
      setAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const sendUni = async (message: string) => {
    if (!ethereum) {
      console.log("Ethereum object doesn't exist!");
      return;
    }

    setIsLoading(true);

    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const portalContract = new ethers.Contract(contractAddress, contractABI, signer);

      const unisTxn = await portalContract.sendUni(message);
      console.log('Mining...', unisTxn.hash);

      await unisTxn.wait();
      console.log('Mined -- ', unisTxn.hash);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      throw error;
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <a href="/">
          <h1 className="mt-10 text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-fuchsia-500">
            UniSend
          </h1>
        </a>
      </div>

      <div className="mt-12 max-w-2xl text-xl text-gray-500 lg:mx-auto">
        Yo mate! I'm{' '}
        <a
          href="https://twitter.com/ferueda"
          target="_blank"
          rel="noreferrer noopener"
          className="text-blue-600 hover:text-blue-800 font-bold"
        >
          Felipe
          <span role="img" aria-label="bird">
            🐦
          </span>
        </a>{' '}
        from Vancouver!{' '}
        <span role="img" aria-label="canada flag">
          🇨🇦
        </span>{' '}
        Make sure to send me a <span className="font-bold text-fuchsia-500">uni</span>
        <span role="img" aria-label="uni">
          🦄
        </span>{' '}
        (or as many as you want). If you don't, I'll be very sad...{' '}
        <span role="img" aria-label="sad">
          😩
        </span>
      </div>

      <div className="w-full">
        {isAppReady ? (
          <UniForm onSubmit={sendUni} isLoading={isLoading} />
        ) : (
          <button
            onClick={connectWallet}
            className="flex mt-10 px-10 py-3 rounded-md text-bold text-fuchsia-700 bg-white border-2 border-fuchsia-600 mx-auto hover:border-fuchsia-800 hover:text-fuchsia-800 mx-auto"
          >
            Connect Wallet
          </button>
        )}
      </div>

      {isAppReady && (
        <div className="flex flex-col w-full mt-12">
          {unisReceived.length === 0 && (
            <div className="mt-20 mx-auto loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-20 w-20" />
          )}
          {unisReceived.map((uni, index) => {
            return (
              <div
                key={index}
                className="w-2/3 border-2 border-fuchsia-500 rounded-md mb-4 px-4 py-2 mx-auto overflow-hidden"
              >
                <a
                  href={`https://rinkeby.etherscan.io/address/${uni.sender}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <span className="text-violet-700">From: </span> {uni.sender}
                </a>
                <div className="text-gray-700">
                  <span className="text-violet-700">Sent on: </span>
                  {new Date(uni.timestamp.toString()).toLocaleDateString()}
                </div>
                <div className="text-gray-700">
                  <span className="text-violet-700">Message: </span>{' '}
                  <span className="font-bold">{uni.message}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default App;
