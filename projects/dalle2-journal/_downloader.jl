using JSON
using CSV
using HTTP
using DataFrames

turtsid = "bZdsI78pamhDuwRFflqknt7e"
jscmd = raw"""
JSON.stringify({
    prompt: $('.image-prompt-input').value,
    batchurl: window.location.href,
    generations: $$('.task-page-generations img').map(i => i.src)
})
"""

function savegenerations(jsoutput)
    records = CSV.read("records.csv", DataFrame, types=String)

    obj = JSON.parse(jsoutput)
    if obj["batchurl"] ∈ records[:, "batchurl"]
        @warn "Batch already exists. Skipping." obj["batchurl"] obj["prompt"]
        return
    end

    id = lpad(nrow(records) + 1, 4, '0')
    push!(records, (;
        id,
        prompt = obj["prompt"],
        batchurl = obj["batchurl"],
        generations = json(obj["generations"]),
    ))


    for (i, url) in enumerate(obj["generations"])
        filename = "$id.$i.webp"
        HTTP.download(url, joinpath("archive", filename))
    end


    CSV.write("records.csv", records)

end

function exportrecords()
    records = CSV.read("records.csv", DataFrame, types=String)
    open("records.js", "w") do file
        write(file, "let records = $(json(eachrow(reverse(records)), 1))")
    end
end