import React, { Component } from "react";

// let id = 0;

const updatePerson = function (persons, oldPerson, updatedPerson) {
  return persons.map((person) =>
    person.id === oldPerson.id ? updatedPerson : person
  );
};

const addNewPerson = function (persons, newPerson) {
  return [...persons, newPerson];
};

export default class App extends Component {
  constructor() {
    super();

    this.state = {
      newId: 0,
      persons: [],
      loaded: false,
    };
  }

  async componentDidMount() {
    const response = await fetch("/persons", {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    this.setState({ persons: result, loaded: true });
  }

  createPerson() {
    // const person = {
    //   name: "",
    //   id: --id,
    // };
    this.setState((state) => ({
      newId: state.newId - 1,
      persons: addNewPerson(state.persons, { name: "", id: state.newId - 1 }),
    }));
  }

  onClickCreatePerson = () => {
    this.createPerson();
  };

  onClickSaveName(person) {
    this.savePerson(person);
  }

  onChangeName(person, event) {
    const name = event.target.value;

    const updatedPerson = {
      ...person,
      name,
    };

    this.setState((state) => ({
      persons: updatePerson(state.persons, person, updatedPerson),
    }));
  }

  async savePerson(person) {
    const isCreate = person.id < 0;
    const method = isCreate ? "POST" : "PATCH";

    if (person.abortController) {
      person.abortController.abort();
    }

    const abortController = new AbortController();

    this.setState((state) => {
      return {
        persons: updatePerson(state.persons, person, {
          ...person,
          abortController,
        }),
      };
    });

    try {
      const response = await fetch("/persons", {
        signal: abortController.signal,
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(person),
      });

      const result = await response.json();

      this.setState((state) => {
        return {
          persons: updatePerson(state.persons, person, {
            ...result,
            abortController: null,
            firstUpdated: true,
          }),
        };
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      throw err;
    }
  }

  renderPersons() {
    return this.state.persons.map((person) => (
      <div
        key={person.id}
        className="challenge-person"
        data-test="challenge-person"
        data-test-person-id={person.id}
        data-test-person-name={person.name}
      >
        <input
          value={person.name}
          className="challenge-person-name"
          onChange={(event) => this.onChangeName(person, event)}
          data-test="challenge-person-name"
        />
        <button
          className="challenge-person-save-name-button"
          onClick={() => this.onClickSaveName(person)}
          data-test="challenge-person-save-name-button"
        >
          Save Name
        </button>
        {person.abortController ? (
          <div className="loadingio-spinner-dual-ring-gjcabcobap">
            <div className="ldio-koxrfjy72mn">
              <div></div>
              <div>
                <div></div>
              </div>
            </div>
          </div>
        ) : (
          person.firstUpdated && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )
        )}
      </div>
    ));
  }

  render() {
    return (
      <div className="challenge">
        {this.state.loaded && (
          <button
            className="challenge-create-person-button"
            onClick={this.onClickCreatePerson}
            data-test="challenge-create-person-button"
          >
            Create Person
          </button>
        )}
        <div className="challenge-persons">{this.renderPersons()}</div>
      </div>
    );
  }
}
