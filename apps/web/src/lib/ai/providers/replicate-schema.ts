type ReplicateInputSchema = {
  properties?: Record<string, { enum?: unknown[]; type?: string | string[] }>;
  required?: string[];
};

type ReplicateModelResponse = {
  latest_version?: {
    openapi_schema?: {
      components?: {
        schemas?: {
          Input?: ReplicateInputSchema;
        };
      };
    };
  };
};

const schemaCache = new Map<string, ReplicateInputSchema | null>();

function isEmptyValue(value: unknown) {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

function coerceEnumValue(value: unknown, options: unknown[]) {
  if (options.includes(value)) {
    return value;
  }

  const stringValue = String(value);
  const stringMatch = options.find((option) => String(option) === stringValue);
  if (stringMatch !== undefined) {
    return stringMatch;
  }

  const lowerMatch = options.find(
    (option) => String(option).toLowerCase() === stringValue.toLowerCase()
  );
  if (lowerMatch !== undefined) {
    return lowerMatch;
  }

  return undefined;
}

async function fetchReplicateInputSchema(modelId: string) {
  if (schemaCache.has(modelId)) {
    return schemaCache.get(modelId) ?? null;
  }

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    schemaCache.set(modelId, null);
    return null;
  }

  try {
    const response = await fetch(`https://api.replicate.com/v1/models/${modelId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 60 * 60 },
    });

    if (!response.ok) {
      schemaCache.set(modelId, null);
      return null;
    }

    const data = (await response.json()) as ReplicateModelResponse;
    const schema =
      data.latest_version?.openapi_schema?.components?.schemas?.Input ?? null;

    schemaCache.set(modelId, schema);
    return schema;
  } catch {
    schemaCache.set(modelId, null);
    return null;
  }
}

export async function normalizeReplicateInputForModel(
  modelId: string,
  input: Record<string, unknown>
) {
  const schema = await fetchReplicateInputSchema(modelId);
  const properties = schema?.properties;

  if (!properties) {
    return Object.fromEntries(
      Object.entries(input).filter(([, value]) => !isEmptyValue(value))
    );
  }

  return Object.fromEntries(
    Object.entries(input)
      .filter(([key, value]) => key in properties && !isEmptyValue(value))
      .map(([key, value]) => {
        const enumOptions = properties[key]?.enum;

        if (enumOptions?.length) {
          const coerced = coerceEnumValue(value, enumOptions);
          return [key, coerced];
        }

        return [key, value];
      })
      .filter(([, value]) => !isEmptyValue(value))
  );
}
