// eslint-disable-next-line
import React, { useEffect, useState } from "react";
import { Card, CardBody, CardText, CardTitle, Col, Container, Navbar, NavbarBrand, Row } from "reactstrap";
import styles from "./App.module.css";
import logo from "./logo.png";

// ToDo - fix failing tests

// Todo add generic typing - checked

type Client = { code: string; givenName: string; surname: string };
type Agent = {
  id: string;
  firstName: string;
  lastName: string;
};

const ItemList = <T extends Client | Agent>({
  nameSelector,
  filterSelector,
  fetchData,
  onSelectedItem,
  dataTestId,
  orderItem,
  isItem,
}: {
  nameSelector: (option: T) => string;
  filterSelector: (filter: string) => (option: T) => boolean;
  fetchData: (abortSignal: AbortSignal) => Promise<T[]>;
  onSelectedItem: (option: T) => void;
  orderItem: (first: T, second: T) => number;
  dataTestId: string;
  isItem: (item: T) => boolean;
}) => {
  const [items, setItems] = useState([] as T[]);
  useEffect(() => {
    const abortController = new AbortController();

    fetchData(abortController.signal).then((data: T[]) => {
      if (data) {
        setItems(data.filter(isItem).sort(orderItem));
      }
    });

    return () => {
      abortController.abort();
    };
  }, []);
  const [filter, setFilter] = useState("");

  // Todo - debounce input
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value ?? "");
  };

  return (
    <>
      <input onChange={handleFilterChange} data-testid={`${dataTestId}-autocomplete`} value={filter}></input>
      <div style={{ height: 300, overflow: "scroll" }}>
        {items.filter(filterSelector(filter)).map((item, index) => (
          <div
            className={styles.item}
            data-testid={`${dataTestId}-autocomplete-suggestion`}
            key={index}
            onClick={() => {
              onSelectedItem(item);
              setFilter(nameSelector(item));
            }}
          >
            {nameSelector(item)}
          </div>
        ))}
      </div>
    </>
  );
};

function App() {
  const [client, setClient] = useState(null as Client | null);
  const [agent, setAgent] = useState(null as Agent | null);

  const clientNameSelector = (client: Client) => {
    return `${client.surname} ${client.givenName}`;
  };

  const agetNameSelector = (agent: Agent) => {
    return `${agent.firstName} ${agent.lastName}`;
  };

  const clientFilter = (filter: string) => (client: Client) => {
    return (client.surname.toLowerCase() + " " + client.givenName.toLowerCase()).includes(filter.toLowerCase());
  };

  const agentFilter = (filter: string) => (agent: Agent) => {
    return (agent.firstName.toLowerCase() + " " + agent.lastName.toLowerCase()).includes(filter.toLowerCase());
  };

  const onSelectedClient = (client: Client) => setClient(client);

  const onSelectedAgent = (agent: Agent) => setAgent(agent);

  const orderItems = (first: string, second: string) => {
    return ("" + first).localeCompare(second);
  };

  const orderClient = (first: Client, second: Client) => {
    return orderItems(first.surname, second.surname);
  };

  const orderAgent = (first: Agent, second: Agent) => {
    return orderItems(first.firstName, second.firstName);
  };

  const isAgent = (agent: Agent) =>
    agent.firstName !== undefined && agent.id !== undefined && agent.lastName !== undefined;

  const isClient = (client: Client) =>
    client.givenName !== undefined && client.code !== undefined && client.surname !== undefined;

  const abortableFetch = (url: string) => (abortSignal: AbortSignal) => {
    return fetch(url, { signal: abortSignal })
      .then((response) => response.json())
      .catch((error) => {
        console.log(error.message);
        return undefined;
      });
  };

  return (
    <Container style={{ minHeight: 500 }}>
      <Navbar color="light" light expand="md">
        <NavbarBrand>
          <img src={logo} alt="Gorgias logo" height="50px" />
        </NavbarBrand>
      </Navbar>
      <Row className="d-flex align-items-center justify-content-center" style={{ minHeight: 500 }}>
        <Col md="6">
          <Card>
            <CardBody>
              <CardTitle tag="h5">Choose Client</CardTitle>
              <ItemList<Client>
                fetchData={abortableFetch("http://localhost:3000/clients")}
                nameSelector={clientNameSelector}
                filterSelector={clientFilter}
                onSelectedItem={onSelectedClient}
                dataTestId="client"
                orderItem={orderClient}
                isItem={isClient}
              />
            </CardBody>
          </Card>
        </Col>
        <Col md="6">
          <Card>
            <CardBody>
              <CardTitle tag="h5">Choose Agent</CardTitle>
              <ItemList<Agent>
                fetchData={abortableFetch("http://localhost:3000/agents")}
                nameSelector={agetNameSelector}
                filterSelector={agentFilter}
                onSelectedItem={onSelectedAgent}
                dataTestId="agent"
                orderItem={orderAgent}
                isItem={isAgent}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Card>
            <CardBody>
              <CardTitle tag="h5">Client</CardTitle>
              <CardText data-testid="client-selection">
                {client?.surname} {client?.givenName} - {client?.code}{" "}
              </CardText>
            </CardBody>
          </Card>
        </Col>
        <Col md="6">
          <Card>
            <CardBody>
              <CardTitle tag="h5">Agent</CardTitle>
              <CardText data-testid="agent-selection">
                {agent?.firstName} {agent?.lastName} - {agent?.id}{" "}
              </CardText>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
