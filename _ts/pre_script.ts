function switchCommitList(idx: number) {
    let elem = document.querySelector(`.commit-list[commit-list-idx="${idx}"]`);
    elem!.classList.toggle("active")
}