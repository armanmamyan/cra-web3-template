import { Toaster } from "react-hot-toast";
import Minter from "./components/Minter";

function App() {
  return (
    <>
      <Minter />
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;
