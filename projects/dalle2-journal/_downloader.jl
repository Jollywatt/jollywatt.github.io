using JSON
using CSV
using HTTP
using DataFrames

turtsid = "bZdsI78pamhDuwRFflqknt7e"
jscmd = raw"""
JSON.stringify({
    prompt: $('.image-prompt-input').value,
    date: new Date().toISOString().split('T')[0],
    batchurl: window.location.href,
    generations: $$('.task-page-generations img').map(i => i.src)
})
"""

function savegenerations(jsoutput; redownload=false)
    records = CSV.read("records.csv", DataFrame, types=String)

    obj = JSON.parse(jsoutput)
    idx = findfirst(==(obj["batchurl"]), records[:, "batchurl"])
    if isnothing(idx)
        id = lpad(nrow(records) + 1, 4, '0')
        push!(records, (;
            id,
            date = obj["date"],
            prompt = obj["prompt"],
            batchurl = obj["batchurl"],
            generations = json(obj["generations"]),
        ))
    else
        if redownload
            id = records[idx, "id"]
        else
            @warn "Batch already exists. Skipping. Pass `redownload=true` to re-download images without affecting the records." obj["batchurl"] obj["prompt"]
            return
        end
    end

    for (i, url) in enumerate(obj["generations"])
        filename = "$id.$i.webp"
        HTTP.download(url, joinpath("archive", filename))
        sleep(0.5)
    end


    CSV.write("records.csv", records)

    written = exportrecords()

    @info "Wrote $written bytes to `records.js`"

end

function exportrecords()
    records = CSV.read("records.csv", DataFrame, types=String)
    open("records.js", "w") do file
        write(file, "let records = $(json(eachrow(reverse(records)), 1))")
    end
end