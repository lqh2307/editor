import React from "react";
import axios from "axios";

export function useFetchAPI(
  url: string,
  options: any
): { data: any; loading: boolean; error: any } {
  const [data, setData] = React.useState<any>();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<any>();

  React.useEffect(() => {
    let isMounted = true;

    axios
      .get(url, options)
      .then((response) => {
        if (isMounted) {
          setData(response.data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [url, options]);

  return { data, loading, error };
}
