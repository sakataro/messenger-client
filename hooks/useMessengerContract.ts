import { BigNumber, ethers } from "ethers";
import { useEffect, useState } from "react";
import { getEthereum } from "../utils/ethereum";
import abi from "../utils/Messenger.json";
import { Messenger as MessengerType } from "../typechain-types";

export type Message = {
  sender: string;
  receiver: string;
  depositInWei: BigNumber;
  timestamp: Date;
  text: string;
  isPending: boolean;
};

type PropsSendMessage = {
  text: string;
  receiver: string;
  tokenInEther: string;
};

type ReturnUseMessengerContract = {
  processing: boolean;
  ownMessages: Message[];
  owner: string | undefined;
  numOfPendingLimits: BigNumber | undefined;
  sendMessage: (props: PropsSendMessage) => void;
  acceptMessage: (index: BigNumber) => void;
  denyMessage: (index: BigNumber) => void;
  changeNumOfPendingLimits: (limits: BigNumber) => void;
};

type PropsUseMessengerContract = {
  currentAccount: string | undefined;
};

const CONTRACT_ADDRESS = "0xdAF902975EcB97D23c6Da8668b166A57378fDFa3";
const CONTRACT_ABI = abi.abi;

export const useMessengerContract = ({
  currentAccount,
}: PropsUseMessengerContract): ReturnUseMessengerContract => {
  const [processing, setProcessing] = useState(false);
  const [messengerContract, setMessengerContract] = useState<MessengerType>();
  const [ownMessages, setOwnMessages] = useState<Message[]>([]);
  const [owner, setOwner] = useState<string>();
  const [numOfPendingLimits, setNumOfPendingLimits] = useState<BigNumber>();

  const ethereum = getEthereum();

  const getMessengerContract = () => {
    try {
      if (!ethereum) {
        console.error("ethereum object does not exist.");
        return;
      }

      const provider = new ethers.providers.Web3Provider(
        ethereum as unknown as ethers.providers.ExternalProvider
      );
      const signer = provider.getSigner();
      const messengerContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      ) as MessengerType;
      setMessengerContract(messengerContract);
    } catch (error) {
      console.error(error);
    }
  };

  const getOwnMessages = async () => {
    if (!messengerContract) {
      return;
    }
    try {
      setProcessing(true);
      const ownMessages = await messengerContract.getOwnMessages();
      const messagesCleaned: Message[] = ownMessages.map((message) => {
        return {
          ...message,
          timestamp: new Date(message.timestamp.toNumber() * 1000),
        };
      });
      setOwnMessages(messagesCleaned);
      setProcessing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = async ({
    text,
    receiver,
    tokenInEther,
  }: PropsSendMessage) => {
    if (!messengerContract) {
      return;
    }
    try {
      const tokenInWei = ethers.utils.parseEther(tokenInEther);
      console.log(
        "call post with receiver:[%s], token:[%s]",
        receiver,
        tokenInWei.toString()
      );

      const txn = await messengerContract.post(text, receiver, {
        gasLimit: 300000,
        value: tokenInWei,
      });
      console.log("Processing .....", txn.hash);
      setProcessing(true);
      await txn.wait();

      console.log("done --", txn.hash);
      setProcessing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const acceptMessage = async (index: BigNumber) => {
    if (!messengerContract) {
      return;
    }
    try {
      console.log("call accept with index [%d]", index);
      const txn = await messengerContract.accept(index, {
        gasLimit: 300000,
      });
      console.log("processing...", txn.hash);
      setProcessing(true);
      await txn.wait();
      console.log("done --", txn.hash);
      setProcessing(false);
    } catch (error) {
      console.log(error);
    }
  };

  const denyMessage = async (index: BigNumber) => {
    if (!messengerContract) {
      return;
    }
    try {
      console.log("call deny with index [%d]", index);
      const txn = await messengerContract.deny(index, {
        gasLimit: 300000,
      });
      console.log("processing...", txn.hash);
      setProcessing(true);
      await txn.wait();
      console.log("done --", txn.hash);
      setProcessing(false);
    } catch (error) {
      console.log(error);
    }
  };

  const getOwner = async () => {
    if (!messengerContract) {
      return;
    }
    try {
      console.log("call getter of owner");
      const owner = await messengerContract.owner();
      setOwner(owner.toLocaleLowerCase());
    } catch (error) {
      console.error(error);
    }
  };

  const getNumOfPendingLimits = async () => {
    if (!messengerContract) {
      return;
    }
    try {
      console.log("call getter of numOfPendingLimits");
      const limits = await messengerContract.numOfPendingLimits();
      setNumOfPendingLimits(limits);
    } catch (error) {
      console.error(error);
    }
  };

  const changeNumOfPendingLimits = async (limits: BigNumber) => {
    if (!messengerContract) {
      return;
    }
    try {
      console.log("call changeNumOfPendingLimits with [%d]", limits.toNumber());
      const txn = await messengerContract.changeNumOfPendingLimits(limits, {
        gasLimit: 300000,
      });
      console.log("Processing ...", txn.hash);
      setProcessing(true);
      await txn.wait();
      console.log("done --", txn.hash);
      setProcessing(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getMessengerContract();
    getOwnMessages();
    getOwner();
    getNumOfPendingLimits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccount, ethereum]);

  useEffect(() => {
    const onNewMessage = (
      sender: string,
      receiver: string,
      depositInWei: BigNumber,
      timestamp: BigNumber,
      text: string,
      isPending: boolean
    ) => {
      console.log("NewMessage from %s to %s", sender, receiver);

      if (receiver.toLocaleLowerCase() === currentAccount) {
        setOwnMessages((prev) => [
          ...prev,
          {
            sender,
            receiver,
            isPending,
            depositInWei,
            timestamp: new Date(timestamp.toNumber() * 1000),
            text,
          },
        ]);
      }
    };

    const onMessageConfirmed = (receiver: string, index: BigNumber) => {
      console.log(
        "message confirmed index: [%d] receiver: [%s]",
        index.toNumber(),
        receiver
      );
      if (receiver.toLocaleLowerCase() === currentAccount) {
        setOwnMessages((prevState) => {
          prevState[index.toNumber()].isPending = false;
          return [...prevState];
        });
      }
    };

    const onNumOfPendingLimitsChanged = (limitsChanged: BigNumber) => {
      console.log(
        "NumOfPendingLimitsChanged limits:[%d]",
        limitsChanged.toNumber()
      );
      setNumOfPendingLimits(limitsChanged);
    };

    if (messengerContract) {
      messengerContract.on("NewMessage", onNewMessage);
      messengerContract.on("MessageConfirmed", onMessageConfirmed);
      messengerContract.on(
        "NumOfPendingLimitsChanged",
        onNumOfPendingLimitsChanged
      );
    }

    return () => {
      if (messengerContract) {
        messengerContract.off("NewMessage", onNewMessage);
        messengerContract.off("MessageConfirmed", onMessageConfirmed);
        messengerContract.off(
          "NumOfPendingLimitsChanged",
          onNumOfPendingLimitsChanged
        );
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messengerContract]);

  return {
    processing,
    ownMessages,
    sendMessage,
    acceptMessage,
    denyMessage,
    owner,
    numOfPendingLimits,
    changeNumOfPendingLimits,
  };
};
