require('dotenv').config();
//
const { ethers } = require("ethers");
//
const hecoPoolAbi = require('./abi/hecoMasterchef.json')
const bscPoolAbi = require('./abi/bscMasterchef.json')
const { POOL_ADDRESS } = require('./config')
async function getData(chainId, fromBlock, toBlock) {
  const rpcUrl = getRpcUrl(chainId);
  const abi = chainId == 56 ? bscPoolAbi : hecoPoolAbi;
  const poolAddr = POOL_ADDRESS[chainId];
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const poolContract = new ethers.Contract(poolAddr, abi, provider);
  const poolFace = new ethers.utils.Interface(abi);
  const filter_log = {
    fromBlock,
    toBlock,
    topics: [poolFace.getEventTopic('Deposit')]
  };
  const log_data = await provider.getLogs(filter_log);
  // console.log('log_data', log_data)
  for(const data of log_data) {
    const args = poolFace.parseLog(data)?.args;
    const pid = args.pid.toString()
    const amount = args.amount.toString()
    const user = args.user
    if(amount > 0 && pid < 28) {
      const nowStake = await poolContract['userInfo'](pid, user);     
      const stakeNum = ethers.utils.formatUnits(nowStake.amount, 18)
      if(stakeNum > 0) {
        console.log({user, pid, stakeNum})
      }
    }
  }
}

function getRpcUrl(chainId) {
  switch (chainId) {
    case 56:
      return process.env.BSC_NODE;
    case 128:
      return process.env.HECO_NODE;  
  }
}

async function getAllData(chainId) {
  const array = Array.from(new Array(4608).keys())
  for(const key of array) {
    console.log({
      fromBlock: 6366569 + 100*key,
      toBlock: 6366569 + 100*(key+1)
    })
    // await getData(chainId, 6366569 + 100*key, 6366569 + 100*(key+1))
  }
}
getAllData(56)