import { Fragment, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { Card, Row, Col, Container, Button } from "react-bootstrap";

import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const { unityProvider, loadingProgression, isLoaded, sendMessage } =
    useUnityContext({
      loaderUrl: "unityBuild/Build/unityBuild.loader.js",
      dataUrl: "unityBuild/Build/unityBuild.data",
      frameworkUrl: "unityBuild/Build/unityBuild.framework.js",
      codeUrl: "unityBuild/Build/unityBuild.wasm",
    });

  const [isOpen, setIsOpen] = useState(false);
  const [isLeft, setIsLeft] = useState(true);
  const [isUp, setIsUp] = useState(false);

  const handleHookButtonClick = () => {
    sendMessage("Pivot 1", "HookController", isOpen ? "close" : "open");
    sendMessage("Pivot 2", "HookController", isOpen ? "close" : "open");
    fetchData(isOpen ? "close-claw" : "open-claw");
    setIsOpen(!isOpen);
  };

  const handleHorizontalClick = () => {
    sendMessage(
      "Mobile parts",
      "DirectionController",
      isLeft ? "right" : "left"
    );
    fetchData(isLeft ? "move-right" : "move-left");
    setIsLeft(!isLeft);
  };
  console.log("URL: ", import.meta.env.VITE_API_URL);
  const fetchData = async (operation) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/${operation}`
      );
      const data = await response.json();
      console.log("Data fetched:", data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleVerticalClick = () => {
    sendMessage("Vertical", "DirectionController", isUp ? "down" : "up");
    fetchData(isUp ? "move-down" : "move-up");
    setIsUp(!isUp);
  };

  return (
    <ErrorBoundary>
      <Container
        fluid
        className="text-center bg-dark text-light d-flex flex-column justify-content-center min-vh-100"
      >
        <h1 className="display-4 mb-4">Digital Twin</h1>
        <Fragment>
          {!isLoaded && (
            <p className="lead text-warning mb-4">
              Loading Application... {Math.round(loadingProgression * 100)}%
            </p>
          )}
          <Row className="d-flex align-items-stretch">
            {/* <Col md={6} className="mb-4 d-flex"> */}
            <Card bg="dark" text="light" className="flex-fill">
              <Card.Body className="d-flex flex-column">
                <Card.Title>3D Model</Card.Title>
                <Unity
                  unityProvider={unityProvider}
                  style={{
                    visibility: isLoaded ? "visible" : "hidden",
                    width: "100%",
                    height: "50vh",
                  }}
                  className="border border-secondary rounded flex-grow-1"
                />
              </Card.Body>
            </Card>
            {/* </Col> */}
            {/* <Col md={6} className="mb-4 d-flex">
              <Card bg="dark" text="light" className="flex-fill">
                <Card.Body className="d-flex flex-column">
                  <Card.Title>Live Stream</Card.Title>
                  <iframe
                    src="https://player.twitch.tv/?channel=gaules&parent=localhost"
                    width="100%"
                    height="50vh"
                    className="border rounded flex-grow-1"
                  ></iframe>
                </Card.Body>
              </Card>
            </Col> */}
          </Row>
          <Row className="mt-4">
            <Col className="d-flex justify-content-center">
              <Button
                onClick={handleHookButtonClick}
                variant="secondary"
                className="mx-4 px-5 "
              >
                {isOpen ? "Close" : "Open"}
              </Button>
              <Button
                onClick={handleHorizontalClick}
                variant="secondary"
                className="mx-4 px-5 "
              >
                {isLeft ? "Right" : "Left"}
              </Button>
              <Button
                onClick={handleVerticalClick}
                variant="secondary"
                className="mx-4 px-5 "
              >
                {isUp ? "Down" : "Up"}
              </Button>
            </Col>
          </Row>
        </Fragment>
      </Container>
    </ErrorBoundary>
  );
}

export default App;
