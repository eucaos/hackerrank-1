import "@testing-library/jest-dom/extend-expect";
import { cleanup, fireEvent, render } from "@testing-library/react";
import React from "react";
import App from "./App";

const totalRecords = 50;

const setup = () => {
  const app = render(<App />);
  return {
    ...app,
    clientAutocomplete: app.getByTestId("client-autocomplete"),
    agentAutocomplete: app.getByTestId("agent-autocomplete"),
    clientSelection: app.getByTestId("client-selection"),
    agentSelection: app.getByTestId("agent-selection"),
  };
};

afterEach(() => {
  cleanup();
});

describe("page renders correctly", () => {
  test("initial UI is rendered and contains client-autocomplete, client-selection, agent-autocomplete, agent-selection", () => {
    const { clientAutocomplete, agentAutocomplete, clientSelection, agentSelection } = setup();
    expect(clientAutocomplete).not.toBeNull();
    expect(agentAutocomplete).not.toBeNull();
    expect(clientSelection).not.toBeNull();
    expect(agentSelection).not.toBeNull();
  });
});

describe("basic agent autocomplete works", () => {
  test("agent autocomplete is displayed", async () => {
    const { agentAutocomplete } = setup();
    expect(agentAutocomplete).not.toBeNull();
  });
  test("agent suggestions are filtered when text is entered", async () => {
    const { agentAutocomplete, findAllByTestId, findAllByText } = setup();
    expect((await findAllByTestId("agent-autocomplete-suggestion")).length).toEqual(totalRecords);
    fireEvent.change(agentAutocomplete, { target: { value: "Deloris" } });
    expect((await findAllByTestId("agent-autocomplete-suggestion")).length).toEqual(1);
    expect((await findAllByText("Deloris", { exact: false })).length).toEqual(1);
  });

  test("filtering is case insensitive", async () => {
    const { agentAutocomplete, findAllByTestId } = setup();
    fireEvent.change(agentAutocomplete, { target: { value: "c" } });
    const results = await findAllByTestId("agent-autocomplete-suggestion");
    fireEvent.change(agentAutocomplete, { target: { value: "C" } });
    const resultsCap = await findAllByTestId("agent-autocomplete-suggestion");
    expect(results).toEqual(resultsCap);
  });

  test("results are ordered alphabetically by first name", async () => {
    const { agentAutocomplete, findAllByTestId } = setup();
    expect((await findAllByTestId("agent-autocomplete-suggestion")).length).toEqual(totalRecords);
    fireEvent.change(agentAutocomplete, { target: { value: "d" } });
    const suggestions = await findAllByTestId("agent-autocomplete-suggestion");
    suggestions.forEach((element, index) => {
      if (suggestions[index + 1]) {
        expect(element?.textContent?.localeCompare(suggestions[index + 1]?.textContent || "zzzzz")).toEqual(-1);
      }
    });
  });

  test("selecting an element will fill the input and filter the suggestions", async () => {
    const { agentAutocomplete, findAllByTestId } = setup();

    expect(agentAutocomplete.value).toBe("");
    let suggestions = await findAllByTestId("agent-autocomplete-suggestion");
    expect(suggestions.length).toEqual(totalRecords);
    fireEvent.click(suggestions[0]);
    expect(agentAutocomplete.value).not.toBe("");
    suggestions = await findAllByTestId("agent-autocomplete-suggestion");
    expect(suggestions.length).toEqual(1);
  });

  test("selecting an element will fill the input with first name and last name", async () => {
    const { agentAutocomplete, findAllByTestId } = setup();

    expect(agentAutocomplete.value).toBe("");
    fireEvent.change(agentAutocomplete, { target: { value: "Cecelia" } });
    let suggestions = await findAllByTestId("agent-autocomplete-suggestion");
    fireEvent.click(suggestions[0]);
    expect(agentAutocomplete.value).toContain("Cecelia");
    expect(agentAutocomplete.value).toContain("Rudolph");
  });

  test("selecting an element will fill the element with data-testid='agent-selection'", async () => {
    const { agentAutocomplete, findAllByTestId, agentSelection } = setup();

    expect(agentSelection.textContent).not.toContain("Cecelia");
    fireEvent.change(agentAutocomplete, { target: { value: "Cecelia" } });
    let suggestions = await findAllByTestId("agent-autocomplete-suggestion");
    fireEvent.click(suggestions[0]);
    expect(agentSelection.textContent).toContain("Cecelia");
    expect(agentSelection.textContent).toContain("Rudolph");
    expect(agentSelection.textContent).toContain("2880");
  });
});

describe("advance agent autocomplete works", () => {
  test("last name filtering works", async () => {
    const { agentAutocomplete, findAllByTestId, findAllByText } = setup();
    expect((await findAllByTestId("agent-autocomplete-suggestion")).length).toEqual(totalRecords);
    fireEvent.change(agentAutocomplete, { target: { value: "Mesta" } });
    expect((await findAllByTestId("agent-autocomplete-suggestion")).length).toEqual(1);
    expect((await findAllByText("Mesta", { exact: false })).length).toEqual(1);
  });

  test("there is no duplicates", async () => {
    const { agentAutocomplete, findAllByTestId } = setup();
    expect((await findAllByTestId("agent-autocomplete-suggestion")).length).toEqual(totalRecords);
    fireEvent.change(agentAutocomplete, { target: { value: "d" } });
    const suggestions = await findAllByTestId("agent-autocomplete-suggestion");
    const suggestionTexts = suggestions.map((s) => s.textContent);
    const uniqueSuggestionTexts = Array.from(new Set(suggestionTexts));
    expect(uniqueSuggestionTexts.length).toEqual(suggestionTexts.length);
  });
});

describe("client and agent filtering and selection works fine", () => {
  test("selecting an agent and a client works", async () => {
    const {
      agentAutocomplete,
      clientAutocomplete,
      clientSelection,
      agentSelection,
      findAllByTestId,
      findAllByText,
    } = setup();
    expect(agentSelection.textContent).not.toContain("Cecelia");
    fireEvent.change(agentAutocomplete, { target: { value: "Cecelia" } });
    let agentSuggestions = await findAllByTestId("agent-autocomplete-suggestion");
    fireEvent.click(agentSuggestions[0]);
    expect(agentAutocomplete.value).toContain("Cecelia");
    expect(agentAutocomplete.value).toContain("Rudolph");
    expect(agentSelection.textContent).toContain("Cecelia");
    expect(agentSelection.textContent).toContain("Rudolph");
    expect(agentSelection.textContent).toContain("2880");

    expect(clientSelection.textContent).not.toContain("Dimple");
    fireEvent.change(clientAutocomplete, { target: { value: "Dimple" } });
    let clientSuggestions = await findAllByTestId("client-autocomplete-suggestion");
    fireEvent.click(clientSuggestions[0]);
    expect(clientAutocomplete.value).toContain("Dimple");
    expect(clientAutocomplete.value).toContain("Saylors");
    expect(clientSelection.textContent).toContain("Dimple");
    expect(clientSelection.textContent).toContain("Saylors");
    expect(clientSelection.textContent).toContain("harns");
  });
});
