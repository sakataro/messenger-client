import Layout from "../../components/layout/Layout";
import SendMessageForm from "../../components/form/SendMessageForm";
import { useWallet } from "../../hooks/useWallet";
import RequireWallet from "../../components/layout/RequireWallet";
import { useMessengerContract } from "../../hooks/useMessengerContract";

export default function SendMessagePage() {
  const { currentAccount, connectWallet } = useWallet();
  const { processing, sendMessage } = useMessengerContract({
    currentAccount,
  });
  return (
    <Layout>
      <RequireWallet
        {...{
          currentAccount,
          connectWallet,
        }}
      >
        {processing ? (
          <div>processing...</div>
        ) : (
          <SendMessageForm
            sendMessage={(
              text: string,
              receiver: string,
              tokenInEther: string
            ) => {
              sendMessage({ text, receiver, tokenInEther });
            }}
          />
        )}
      </RequireWallet>
    </Layout>
  );
}
