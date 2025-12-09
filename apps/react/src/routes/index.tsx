import { createFileRoute } from "@tanstack/react-router";
import Playground from "../components/Playground";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <Playground title="@codoodle" description="Welcome to Codoodle Labs!" />
  );
}
