import React from "react";
import { Text, Custom, View } from "react-xnft";

export function App() {
  return (
    <View>
      <HorizontalCentralize>
        <VerticalCentralize>
          <Text>
            Xnft pending update. If you're the developer of this app please get
            in touch on discord.
          </Text>
        </VerticalCentralize>
      </HorizontalCentralize>
    </View>
  );
}

export const HorizontalCentralize = ({ children }) => {
  return (
    <Custom
      component={"div"}
      style={{ display: "flex", justifyContent: "center", padding: 15 }}
    >
      {children}
    </Custom>
  );
};

export const VerticalCentralize = ({ children }) => {
  return (
    <Custom
      component={"div"}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      {children}
    </Custom>
  );
};
