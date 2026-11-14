import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";


const ROBOFLOW_MODEL_ID = "vehicle-eligibility/5";
const ROBOFLOW_API_URL =
  "https://serverless.roboflow.com";

const ELIGIBLE_VEHICLES = new Set([
  "auv",
  "coupe_convertible",
  "crossover_suv",
  "hatchback",
  "large_suv",
  "pickup",
  "sedan",
  "station_wagon",
  "van_minivan",
]);

const NOT_ELIGIBLE_VEHICLES = new Set([
  "agricultural_equipment",
  "bus",
  "commercial_truck",
  "ebike",
  "heavy_equipment",
  "motorcycle",
  "specialty_vehicle",
  "tricycle",
]);

const UNSURE_VEHICLES = new Set([
  "ev_hybrid",
]);


const NON_VEHICLE_CLASSES = new Set([
  "person",
  "bird",
  "dog",
  "cat",
  "fish",
  "bicycle",
  "scooter",
  "traffic_sign",
  "traffic_light",
  "shopping_cart",
  "chair",
  "table",
  "sofa",
  "bed",
  "door",
  "trashcan",
  "phone",
  "laptop",
  "tablet",
  "camera",
  "computer",
  "computer_mouse",
  "backpack",
  "bag",
  "money_bill",
  "calculator",
  "ballpen",
  "pencil",
  "shoe",
  "slipper",
  "clothes",
  "building",
  "elevator",
  "escalator",
  "ceiling",
  "road",
  "sky",
  "water",
  "fruit",
  "tree",
  "dumbell",
  "beverage",
  "ceiling_fan",
  "electric_fan",
  "air_conditioner",
  "light_bulb",
  "led_light",
]);


function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods":
      "POST, OPTIONS",
  };
}

function jsonResponse(
  body: Record<string, unknown>,
  status = 200
) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        ...corsHeaders(),
        "Content-Type": "application/json",
      },
    }
  );
}

function classifyVehicle(
  vehicleClass: string | null,
) {
  if (!vehicleClass) {
    return {
      eligibility: "unsure",
      message:
        "⚠️ Admin review required. The AI could not confidently detect a supported vehicle.",
    };
  }

  const normalizedClass =
    vehicleClass.toLowerCase().trim();

  
 
  if (NON_VEHICLE_CLASSES.has(normalizedClass)) {
    return {
      eligibility: "not_eligible",
      message:
        "Not eligible. The uploaded image contains a non-vehicle object, not a supported repair vehicle.",
    };
  }



  if (
    UNSURE_VEHICLES.has(
      normalizedClass
    )
  ) {
    return {
      eligibility: "unsure",
      message:
        "⚠️ Admin review required. The AI detected this vehicle type but could not confidently classify it for automatic eligibility.",
    };
  }

  if (
    ELIGIBLE_VEHICLES.has(
      normalizedClass
    )
  ) {
    return {
      eligibility: "eligible",
      message:
        "Vehicle appears eligible for service.",
    };
  }

  if (
    NOT_ELIGIBLE_VEHICLES.has(
      normalizedClass
    )
  ) {
    return {
      eligibility: "not_eligible",
      message:
        "Vehicle cannot be automatically approved because it is outside the supported repair vehicle types.",
    };
  }

  return {
    eligibility: "unsure",
    message:
      "⚠️ Admin review required. The AI detected an unknown vehicle type.",
  };
}


async function getAttachmentUrl(
  supabaseAdmin: ReturnType<typeof createClient>,
  filePath: string
) {
  const {
    data,
    error,
  } = await supabaseAdmin.storage
    .from("service-task-attachments")
    .createSignedUrl(
      filePath,
      300
    );

  if (error) {
    throw new Error(
      `Unable to create attachment URL: ${error.message}`
    );
  }

  if (!data?.signedUrl) {
    throw new Error(
      "Unable to create attachment URL."
    );
  }

  return data.signedUrl;
}

async function runRoboflow(
  imageUrl: string,
  apiKey: string
) {
  const url =
    `${ROBOFLOW_API_URL}/` +
    `${ROBOFLOW_MODEL_ID}`;

  console.log(
    "Calling Roboflow:",
    {
      model: ROBOFLOW_MODEL_ID,
      imageUrlPreview:
        imageUrl.substring(0, 120) + "...",
    }
  );

  const response = await fetch(
    `${url}?api_key=${encodeURIComponent(
      apiKey
    )}&image=${encodeURIComponent(
      imageUrl
    )}`,
    {
      method: "POST",
    }
  );

  const responseText =
    await response.text();

  console.log(
    "Roboflow HTTP status:",
    response.status
  );

  console.log(
    "Roboflow raw response:",
    responseText
  );

  if (!response.ok) {
    throw new Error(
      `Roboflow request failed (${response.status}): ${responseText}`
    );
  }

  try {
    return JSON.parse(
      responseText
    );
  } catch {
    throw new Error(
      `Roboflow returned invalid JSON: ${responseText}`
    );
  }
}

Deno.serve(async (req) => {
  let supabaseAdmin: ReturnType<typeof createClient> | null = null;
  let appointmentId: number | null = null;
  if (
    req.method === "OPTIONS"
  ) {
    return new Response(
      "ok",
      {
        headers: corsHeaders(),
      }
    );
  }

  try {
    if (
      req.method !== "POST"
    ) {
      return jsonResponse(
        {
          error:
            "Only POST requests are allowed.",
        },
        405
      );
    }

    const supabaseUrl =
      Deno.env.get(
        "SUPABASE_URL"
      );

    const supabaseServiceRoleKey =
      Deno.env.get(
        "SUPABASE_SERVICE_ROLE_KEY"
      );

    const roboflowApiKey =
      Deno.env.get(
        "ROBOFLOW_API_KEY"
      );

    if (!supabaseUrl) {
      throw new Error(
        "SUPABASE_URL is not configured."
      );
    }

    if (
      !supabaseServiceRoleKey
    ) {
      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY is not configured."
      );
    }

    if (!roboflowApiKey) {
      throw new Error(
        "ROBOFLOW_API_KEY is not configured."
      );
    }

   supabaseAdmin = createClient(
     supabaseUrl,
     supabaseServiceRoleKey
   );

    const body =
      await req.json();
appointmentId = Number(body?.appointment_id);
    const attachmentPath =
      body?.attachment_path;

    if (
      !Number.isInteger(
        appointmentId
      ) ||
      appointmentId <= 0
    ) {
      return jsonResponse(
        {
          error:
            "A valid appointment_id is required.",
        },
        400
      );
    }

    if (
      !attachmentPath ||
      typeof attachmentPath !==
        "string"
    ) {
      return jsonResponse(
        {
          error:
            "attachment_path is required.",
        },
        400
      );
    }

    console.log(
      "Starting vehicle check:",
      {
        appointmentId,
        attachmentPath,
      }
    );

    const attachmentUrl =
      await getAttachmentUrl(
        supabaseAdmin,
        attachmentPath
      );

    const roboflowResult =
      await runRoboflow(
        attachmentUrl,
        roboflowApiKey
      );

    console.log(
      "Roboflow result:",
      JSON.stringify(
        roboflowResult
      )
    );

    const predictions =
      Array.isArray(
        roboflowResult?.predictions
      )
        ? roboflowResult.predictions
        : [];

    if (
  predictions.length === 0
) {
  const result =
    classifyVehicle(null);


      const {
        error: updateError,
      } = await supabaseAdmin
        .from("appointments")
        .update({
          vehicle_type: null,
          vehicle_eligibility:
            result.eligibility,
          vehicle_detection_message:
            result.message,
          vehicle_detection_confidence:
            null,
          vehicle_detected_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          appointmentId
        );

      if (updateError) {
        throw new Error(
          `Failed to update appointment: ${updateError.message}`
        );
      }

      return jsonResponse({
        success: true,
        appointment_id:
          appointmentId,
        vehicle_type: null,
        vehicle_eligibility:
          result.eligibility,
        vehicle_detection_message:
          result.message,
        vehicle_detection_confidence:
          null,
        predictions,
      });
    }

    const bestPrediction =
      [...predictions].sort(
        (a, b) =>
          Number(
            b?.confidence || 0
          ) -
          Number(
            a?.confidence || 0
          )
      )[0];

    const detectedClass =
      bestPrediction?.class
        ? String(
            bestPrediction.class
          )
        : null;

    const confidence = Number(
      bestPrediction?.confidence ||
        0
    );

    /*
      We treat very low-confidence
      detections as unsure.

      This prevents the AI from
      automatically rejecting a booking
      when the detection itself is weak.
    */
    const MIN_CONFIDENCE = 0.50;


const normalizedDetectedClass =
  detectedClass?.toLowerCase().trim() ?? null;

let result;

if (
  normalizedDetectedClass &&
  NON_VEHICLE_CLASSES.has(normalizedDetectedClass)
) {
  result = {
    eligibility: "not_eligible",
    message:
      "Not eligible. The uploaded image contains a non-vehicle object, not a supported repair vehicle.",
  };
} else if (
  normalizedDetectedClass &&
  NOT_ELIGIBLE_VEHICLES.has(normalizedDetectedClass)
) {
  result = {
    eligibility: "not_eligible",
    message:
      "Vehicle cannot be automatically approved because it is outside the supported repair vehicle types.",
  };
} else if (
  confidence < MIN_CONFIDENCE
) {
  result = {
    eligibility: "unsure",
    message:
      "⚠️ Admin review required. The AI detection confidence was too low for automatic classification.",
  };
} else {
  result = classifyVehicle(detectedClass);
}






    const {
      error: updateError,
    } = await supabaseAdmin
      .from("appointments")
      .update({
        vehicle_type:
          detectedClass,
        vehicle_eligibility:
          result.eligibility,
        vehicle_detection_message:
          result.message,
        vehicle_detection_confidence:
          confidence,
        vehicle_detected_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        appointmentId
      );

    if (updateError) {
      throw new Error(
        `Failed to update appointment: ${updateError.message}`
      );
    }

    return jsonResponse({
      success: true,
      appointment_id:
        appointmentId,
      vehicle_type:
        detectedClass,
      vehicle_eligibility:
        result.eligibility,
      vehicle_detection_message:
        result.message,
      vehicle_detection_confidence:
        confidence,
      predictions,
    });



    
  } catch (error) {
    console.error("Vehicle check error:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Vehicle detection failed.";

    if (supabaseAdmin && appointmentId !== null) {
      try {
        const { error: fallbackError } = await supabaseAdmin
          .from("appointments")
          .update({
            vehicle_type: null,
            vehicle_eligibility: "unsure",
            vehicle_detection_message:
              "⚠️ Admin review required. The Vehicle AI check could not be completed.",
            vehicle_detection_confidence: null,
            vehicle_detected_at: new Date().toISOString(),
          })
          .eq("id", appointmentId);

        if (fallbackError) {
          console.error(
            "Failed to save AI fallback status:",
            fallbackError.message,
          );
        } else {
          console.log(
            "Appointment moved to UNSURE after AI failure:",
            appointmentId,
          );
        }
      } catch (fallbackError) {
        console.error(
          "Exception while saving AI fallback status:",
          fallbackError,
        );
      }
    } else {
      console.error(
        "Fallback update skipped: Supabase client or valid appointment ID unavailable.",
      );
    }

    return jsonResponse(
      {
        success: false,
        appointment_id: appointmentId,
        vehicle_type: null,
        vehicle_eligibility: "unsure",
        vehicle_detection_message:
          "⚠️ Admin review required. The Vehicle AI check could not be completed.",
        vehicle_detection_confidence: null,
        error: errorMessage,
      },
      500,
    );
  



  }
});