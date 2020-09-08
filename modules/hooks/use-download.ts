import { useAuth0 } from "auth/auth0";
import format from "date-fns/format";

export type DownloadResult = { error?: any };
export const useDownload = () => {
  const auth0 = useAuth0();

  return async (
    fileNameFormat: string,
    input: RequestInfo,
    init?: RequestInit
  ): Promise<DownloadResult> => {
    try {
      const token = await auth0.getToken();

      const initWithAuth = {
        ...init,

        headers: {
          ...(init?.headers ?? {}),
          authorization: `BEARER ${token}`,
          "Content-Type": "application/json",
        },
      };

      const fileName = formatFileName(fileNameFormat);

      const response = await fetch(input, initWithAuth);
      if (!response.ok)
        throw `There was a problem downloading your file. (${response.status} ${response.statusText})`;

      const blob = await response.blob();

      // initiate the download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      // We need to append the element to the dom -> otherwise it will not work in firefox
      document.body.appendChild(a);
      a.click();
      // Afterwards we remove the element again
      a.remove();
      return {};
    } catch (error) {
      return { error };
    }
  };
};

const formatFileName = (filenameFormat: string) => {
  let result = filenameFormat;
  const regex = /{.*}/gm;
  let m;

  while ((m = regex.exec(filenameFormat)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    // The result can be accessed through the `m`-variable.
    m.forEach((match, groupIndex) => {
      const replacement = format(
        new Date(),
        match.replace("{", "").replace("}", "")
      );
      result = result.replace(match, replacement);
    });
  }

  return result;
};
