import { BigNumber, ethers } from "ethers";
import MessageCard from "../../components/card/MessageCard";
import Layout from "../../components/layout/Layout";
import RequireWallet from "../../components/layout/RequireWallet";
import {
  Message,
  useMessengerContract,
} from "../../hooks/useMessengerContract";
import { useWallet } from "../../hooks/useWallet";

export default function ConfirmMessagePage() {
  const { currentAccount, connectWallet } = useWallet();
  const message: Message = {
    depositInWei: BigNumber.from("1000000000000000000"),
    timestamp: new Date(1),
    text: "message",
    isPending: true,
    sender: "0x~",
    receiver: "0x~",
  };
  const { ownMessages, acceptMessage, denyMessage, processing } =
    useMessengerContract({
      currentAccount,
    });

  return (
    <Layout>
      <RequireWallet
        currentAccount={currentAccount}
        connectWallet={connectWallet}
      >
        {processing && <div>processing...</div>}
        {ownMessages.map((message, index) => {
          return (
            <div key={index}>
              <MessageCard
                message={message}
                onClickAccept={() => {
                  acceptMessage(BigNumber.from(index));
                }}
                onClickDeny={() => {
                  denyMessage(BigNumber.from(index));
                }}
              />
            </div>
          );
        })}
      </RequireWallet>
    </Layout>
  );
}
