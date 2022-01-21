const main = async () => {
  const uniContractFactory = await hre.ethers.getContractFactory('UniPortal');
  const uniContract = await uniContractFactory.deploy({
    value: hre.ethers.utils.parseEther('0.1'),
  });
  await uniContract.deployed();
  console.log('Contract address:', uniContract.address);

  let contractBalance = await hre.ethers.provider.getBalance(uniContract.address);
  console.log('Contract balance:', hre.ethers.utils.formatEther(contractBalance));

  let uniCount;
  uniCount = await uniContract.getTotalUnis();
  console.log(uniCount.toNumber());

  let uniTxn = await uniContract.sendUni('Here you are, a nice uni!, 🦄');
  await uniTxn.wait();

  const [_, randomPunk] = await hre.ethers.getSigners();
  uniTxn = await uniContract.connect(randomPunk).sendUni('Another uni for you!, 🦄');
  await uniTxn.wait();

  contractBalance = await hre.ethers.provider.getBalance(uniContract.address);
  console.log('Contract balance:', hre.ethers.utils.formatEther(contractBalance));

  let allUnis = await uniContract.getAllUnis();
  console.log(allUnis);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
