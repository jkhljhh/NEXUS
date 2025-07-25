export async function getTableData(query: string) {
  const res = await fetch("http://localhost:8000/query", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  const data = await res.json();
  console.log(data);

  if (data.status === "error") {
    throw data.message;
  }

  return {
    title: data.data.table.title,
    subtitle: data.data.table.subtitle,
    data: data.data.table.data,
  };
}

export async function getGraphData() {
  const res = await fetch("http://localhost:8000/generate-graph", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();

  return {
    title: data.title,
    subtitle: data.subtitle,
    data: data.graphs,
  };
}
